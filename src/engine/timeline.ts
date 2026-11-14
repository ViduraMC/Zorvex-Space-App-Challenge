/**
 * Plays an episode script: pages in order, steps in order. Owns Skip and Next.
 *  - Next: finishes the typing, then moves the story on.
 *  - Skip: leaves the current mini-game; outside a mini-game it jumps to the next page.
 */
import gsap from 'gsap';
import { Vector3 } from 'three';
import { runGame, type BaseGameConfig } from './play';
import { progress } from './progress';
import type { Scope } from './scope';
import type { EpisodeContext, SceneHandles, Shot, Step } from './types';

const DEFAULT_SHOT_EASE = 'sine.inOut';

export class Timeline {
  readonly #ctx: EpisodeContext;
  readonly #calls: NonNullable<SceneHandles['calls']>;
  #skipGame: (() => void) | null = null;
  #skipPage: (() => void) | null = null;

  constructor(ctx: EpisodeContext, calls: SceneHandles['calls']) {
    this.#ctx = ctx;
    this.#calls = calls ?? {};
  }

  /** The Skip button. */
  skip(): void {
    if (this.#skipGame) this.#skipGame();
    else this.#skipPage?.();
  }

  /** Play every page; resolves after the last one. */
  async run(root: Scope): Promise<void> {
    const { comic, director, machine, episode } = this.#ctx;
    const pages = episode.pages;
    for (let i = 0; i < pages.length; i++) {
      const page = root.child();
      comic.pageCut(i + 1, pages.length);
      director.follow(null);
      director.setFraming('comic');
      machine.talking = false;
      await root.wait(
        new Promise<void>((resolve) => {
          this.#skipPage = resolve;
          void this.#steps(pages[i], page).then(resolve);
        }),
      );
      this.#skipGame = null;
      page.dispose();
      machine.stop();
    }
    this.#skipPage = null;
    comic.clear();
  }

  async #steps(steps: Step[], scope: Scope): Promise<void> {
    for (const step of steps) {
      if (!scope.alive) return;
      await scope.wait(this.#step(step, scope));
    }
  }

  #shot(shot: Shot): Promise<void> {
    const { director, objects, machine } = this.#ctx;
    const origin = new Vector3();
    if (shot.rel) this.#ctx.resolve(shot.rel, origin);
    const add = (v: readonly [number, number, number]): [number, number, number] => [v[0] + origin.x, v[1] + origin.y, v[2] + origin.z];
    if (shot.follow === false) director.follow(null);
    else if (shot.follow) director.follow(shot.follow === 'machine' ? machine.root : (objects[shot.follow] ?? null));
    return director.shot({ pos: add(shot.pos), look: add(shot.look), ms: shot.ms, ease: DEFAULT_SHOT_EASE });
  }

  async #step(step: Step, scope: Scope): Promise<void> {
    const ctx = this.#ctx;
    const { comic, audio, machine, t, episode } = ctx;

    if ('caption' in step) {
      const text = t(step.caption);
      audio.say(text, { episode: episode.id, key: step.caption, role: 'narrator' });
      await scope.wait(comic.caption(text));
      await scope.wait(step.auto ? scope.sleep(step.auto) : comic.next());
    } else if ('say' in step) {
      if (import.meta.env.DEV && step.fact && !ctx.fact(step.fact)) {
        console.warn(`[facts] "${step.say}" points at unknown fact "${step.fact}"`);
      }
      if (step.auto) {
        machine.talking = true;
        const text = t(step.say);
        ctx.speaker(step.by);
        audio.say(text, { episode: episode.id, key: step.say, role: step.by ?? 'machine' });
        await scope.wait(comic.bubble(text));
        await scope.sleep(step.auto);
        machine.talking = false;
      } else {
        await ctx.say(step.say, scope, step.by);
      }
    } else if ('sfx' in step) {
      comic.sfx(t(step.sfx));
      if (step.sound) audio.play(step.sound);
    } else if ('sound' in step) {
      audio.play(step.sound);
    } else if ('shot' in step) {
      const move = this.#shot(step.shot);
      if (step.block) await scope.wait(move);
    } else if ('stage' in step) {
      ctx.setStage(step.stage);
      if (step.sky) void ctx.sky.set(step.sky);
    } else if ('sky' in step) {
      const change = ctx.sky.set(step.sky, step.ms);
      if (step.block) await scope.wait(change);
    } else if ('fx' in step) {
      ctx.fx.burst(step.fx, ctx.resolve(step.at));
    } else if ('wait' in step) {
      await scope.sleep(step.wait);
    } else if ('act' in step) {
      comic.hideBubble();
      await scope.wait(comic.act(t(step.act)));
    } else if ('choice' in step) {
      const picked = step.choice[await scope.wait(comic.choice(step.choice.map((c) => t(c.label))))];
      if (picked.say) await ctx.say(picked.say, scope);
    } else if ('call' in step) {
      const fn = this.#calls[step.call];
      if (!fn) console.error(`[timeline] scene.ts has no call named "${step.call}"`);
      else if (step.block === false) void fn(ctx, scope);
      else await scope.wait(fn(ctx, scope));
    } else if ('place' in step) {
      machine.place(step.place.x, step.place.z, step.place.heading);
    } else if ('power' in step) {
      // tweened through a proxy: driving kills every tween on the machine itself
      const glow = { v: machine.power };
      gsap.to(glow, { v: step.power, duration: (step.ms ?? 0) / 1000, onUpdate: () => void (machine.power = glow.v) });
    } else if ('play' in step) {
      await runGame(ctx, step.play, step.config as BaseGameConfig, scope, (skip) => {
        this.#skipGame = skip;
      });
    } else if ('patch' in step) {
      progress.finish(episode.id);
      comic.sfx(t('ui.sfx.patch'));
      audio.play('win');
    }
  }
}
