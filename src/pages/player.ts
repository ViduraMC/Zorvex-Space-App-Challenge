/** Plays any episode: builds its world, runs its script, then shows the patch and the extras. */
import { Material, Mesh, Scene, Texture, Vector3 } from 'three';
import type { Object3D } from 'three';
import { button, el, link } from '../dom';
import { audio } from '../engine/audio';
import { Comic } from '../engine/comic/comic';
import { Director } from '../engine/director';
import { Fx } from '../engine/fx';
import { t, useEpisode } from '../engine/i18n';
import { buildPlaceholder, createMaterials, loadGlb, Machine, partsFromModel } from '../engine/models';
import { progress } from '../engine/progress';
import { Renderer } from '../engine/renderer';
import { go, type Page } from '../engine/router';
import { runFrames, Scope } from '../engine/scope';
import { Sky, SKY_PRESETS, type SkyPreset } from '../engine/sky';
import { Timeline } from '../engine/timeline';
import type { EpisodeContext, EpisodeDef, SceneHandles, Target } from '../engine/types';
import { createWorld, type World, type WorldKind } from '../engine/worlds';
import { factsOf, findEpisode } from '../episodes';
import { patchNode } from '../features/patch';
import { skyTonightCard } from '../features/sky-tonight';

const MAX_FRAME_S = 0.05;
/** The sky each extra stage starts with. */
const STAGE_SKY: Record<WorldKind, SkyPreset> = { mars: 'marsDay', moon: 'moonDay', space: 'space', earth: 'earthDay' };

interface Stage {
  scene: Scene;
  world: World;
  sky: Sky;
  fx: Fx;
}
const DEFAULT_MODEL_BUBBLE_HEIGHT = 1;
/** Slow drift around the machine behind the cover, so even the title screen moves. */
const COVER_SHOT = { from: [3.6, 1.0, 2.8], to: [2.7, 0.7, 2.1], look: [0, 0.3, 0], ms: 24000 } as const;

function disposeScene(scene: Scene): void {
  scene.traverse((obj) => {
    if (!(obj instanceof Mesh)) return;
    obj.geometry.dispose();
    for (const mat of (Array.isArray(obj.material) ? obj.material : [obj.material]) as Material[]) {
      for (const value of Object.values(mat)) if (value instanceof Texture) value.dispose();
      mat.dispose();
    }
  });
}

export const playerPage: Page = (root, id) => {
  const episode = findEpisode(id);
  if (!episode) {
    go('#home');
    return;
  }
  useEpisode(id);
  const shell = el('div', 'player', undefined, root);
  shell.dataset.style = episode.style ?? 'comic';
  const canvas = el('canvas', 'gl', undefined, shell);
  canvas.setAttribute('aria-hidden', 'true');

  let renderer: Renderer;
  try {
    renderer = new Renderer(canvas, progress.get().quality);
  } catch {
    const box = el('div', 'fallback', t('ui.noWebgl'), shell);
    link('btn', t('ui.home'), '#home', box);
    return () => useEpisode('');
  }

  const session = new Scope();
  session.add(() => {
    renderer.dispose();
    audio.hush();
    audio.drive(0);
    useEpisode('');
  });
  void play(episode, shell, canvas, renderer, session);
  return () => session.dispose();
};

async function play(
  episode: EpisodeDef,
  shell: HTMLElement,
  canvas: HTMLCanvasElement,
  renderer: Renderer,
  session: Scope,
): Promise<void> {
  const quality = renderer.quality;
  const anisotropy = renderer.gl.capabilities.getMaxAnisotropy();
  const scene = new Scene();
  const director = new Director(canvas);
  session.add(() => director.dispose());
  session.add(() => disposeScene(scene));

  const loading = el('div', 'loading', t('ui.loading'), shell);
  const site = episode.site ? await session.wait(episode.site()) : undefined;
  const world = createWorld(episode.world, { quality, anisotropy, clear: episode.clear, site });
  scene.add(world.group);
  director.groundAt = world.heightAt;
  const sky = new Sky(scene, renderer.gl, episode.world, quality, SKY_PRESETS[episode.sky]);
  const fx = new Fx(scene, quality);
  session.add(() => fx.dispose());

  // extra stages: each its own scene, world, sky and effects (a launch on Earth, a cruise in space)
  const stages = new Map<WorldKind, Stage>([[episode.world, { scene, world, sky, fx }]]);
  for (const kind of episode.stages ?? []) {
    if (stages.has(kind)) continue;
    const stageScene = new Scene();
    const stageWorld = createWorld(kind, { quality, anisotropy });
    stageScene.add(stageWorld.group);
    const stageFx = new Fx(stageScene, quality);
    stages.set(kind, {
      scene: stageScene,
      world: stageWorld,
      sky: new Sky(stageScene, renderer.gl, kind, quality, SKY_PRESETS[STAGE_SKY[kind]]),
      fx: stageFx,
    });
    session.add(() => {
      stageFx.dispose();
      disposeScene(stageScene);
    });
  }
  const stageOf = (kind: WorldKind): Stage => {
    const found = stages.get(kind);
    if (!found) throw new Error(`[player] episode ${episode.id} has no stage "${kind}"; add it to stages`);
    return found;
  };
  let current = stageOf(episode.world);
  const materials = createMaterials(anisotropy);

  const handles: SceneHandles = episode.scene
    ? await session.wait(episode.scene({ scene, world, materials, quality, anisotropy, stage: stageOf }))
    : {};
  let parts = handles.machine;
  if (!parts && episode.machine.model) {
    const model = await session.wait(loadGlb(episode.id, episode.machine.model));
    if (model) parts = partsFromModel(model, episode.machine.scale ?? 1, DEFAULT_MODEL_BUBBLE_HEIGHT);
  }
  const machine = new Machine(parts ?? buildPlaceholder(materials), scene, world.heightAt);
  session.add(() => machine.dispose());
  const start = episode.machine.start ?? { x: 0, z: 0 };
  machine.place(start.x, start.z, start.heading ?? 0);
  if (machine.parts.wheels) fx.trail(machine.root, world.kind === 'moon' ? 'moonDust' : 'dustPuff', 9);
  loading.remove();

  const comic = new Comic(el('div', 'comic', undefined, shell));
  session.add(() => comic.dispose());
  comic.setSpeaker(t('machine'));

  const objects = handles.objects ?? {};
  const facts = factsOf(episode.id);
  const tmp = new Vector3();
  const resolve = (target: Target, out = new Vector3()): Vector3 => {
    if (typeof target !== 'string') return out.set(target[0], target[1], target[2]);
    if (target === 'machine') return out.set(machine.x, machine.root.position.y, machine.z);
    const obj = objects[target];
    if (!obj) {
      console.error(`[player] no scene object named "${target}"`);
      return out.set(0, 0, 0);
    }
    return obj.getWorldPosition(out);
  };
  const project = (point: Vector3): { x: number; y: number; visible: boolean } => {
    tmp.copy(point).project(director.camera);
    return { x: (tmp.x * 0.5 + 0.5) * window.innerWidth, y: (-tmp.y * 0.5 + 0.5) * window.innerHeight, visible: tmp.z < 1 };
  };
  const ctx: EpisodeContext = {
    episode,
    scene,
    camera: director.camera,
    canvas,
    world,
    sky,
    director,
    comic,
    audio,
    fx,
    machine,
    objects,
    stageKind: episode.world,
    setStage(kind) {
      if (kind === ctx.stageKind) return;
      current = stageOf(kind);
      Object.assign(ctx, { stageKind: kind, scene: current.scene, world: current.world, sky: current.sky, fx: current.fx });
      director.groundAt = current.world.heightAt;
      renderer.setScene(current.scene, director.camera);
    },
    quality,
    t,
    fact: (factId) => facts.find((f) => f.id === factId),
    resolve,
    project,
    async say(key, scope) {
      machine.talking = true;
      const text = t(key);
      audio.say(text, { episode: episode.id, key, robot: true });
      await scope.wait(comic.bubble(text));
      await scope.wait(comic.next());
      machine.talking = false;
    },
  };
  const timeline = new Timeline(ctx, handles.calls);
  handles.onReady?.(ctx);
  // dev only: lets us poke the running episode from the browser console and from UI tests
  if (import.meta.env.DEV) Object.assign(window, { zx: { ctx, renderer, timeline } });

  renderer.setScene(scene, director.camera);
  const onResize = (): void => {
    renderer.resize();
    director.resize();
  };
  session.listen(window, 'resize', onResize);
  onResize();

  // ---- HUD: always-available controls ----
  const hud = el('div', 'hud', undefined, shell);
  button('mini', t('ui.home'), () => go('#home'), hud);
  const toggle = (label: string, on: boolean, set: (on: boolean) => void): void => {
    const b = button('mini', label, () => {
      const next = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(next));
      set(next);
    }, hud);
    b.setAttribute('aria-pressed', String(on));
  };
  toggle(t('ui.sound'), audio.soundOn, (on) => audio.setSound(on));
  toggle(t('ui.voice'), audio.voiceOn, (on) => audio.setVoice(on));
  button('mini', t(quality === 'high' ? 'ui.quality.high' : 'ui.quality.low'), () => {
    // world detail and shadow sizes are chosen at build time, so the episode restarts
    progress.set({ quality: quality === 'high' ? 'low' : 'high' });
    go(location.hash);
  }, hud);
  const skip = button('mini skip', t('ui.skip'), () => timeline.skip(), hud);
  skip.hidden = true;

  session.listen(window, 'keydown', (e: KeyboardEvent) => {
    const onButton = document.activeElement instanceof HTMLButtonElement;
    if ((e.key === 'ArrowRight' || (e.key === ' ' && !onButton)) && comic.waiting) {
      e.preventDefault();
      comic.pressNext();
    }
  });

  // ---- main loop ----
  let last = performance.now();
  let raf = 0;
  const under = new Vector3();
  const frame = (now: number): void => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(MAX_FRAME_S, (now - last) / 1000);
    const time = now / 1000;
    last = now;
    runFrames(dt, time);
    handles.update?.(dt, time);
    machine.update(dt, time);
    current.world.update(dt, time);
    current.sky.focus.set(machine.x, 0, machine.z);
    current.sky.update(director.camera);
    director.update(dt);
    current.fx.update(dt);
    if (comic.bubbleVisible) {
      let top: Object3D = machine.root;
      while (top.parent) top = top.parent;
      if (top === current.scene) {
        const anchor = project(machine.bubblePoint(under));
        const below = project(under.set(machine.x, machine.root.position.y - 0.05, machine.z));
        comic.placeBubble(anchor.x, anchor.y, below.y);
      } else {
        // the machine is not on this stage: speak from the lower middle of the screen
        comic.placeBubble(window.innerWidth * 0.4, window.innerHeight * 0.72, window.innerHeight);
      }
    }
    audio.drive(machine.moving ? 1 : 0);
    renderer.render(dt);
  };
  raf = requestAnimationFrame(frame);
  session.add(() => cancelAnimationFrame(raf));

  // ---- cover: title, mystery question, and the tap that unlocks sound ----
  const at = resolve('machine');
  const rel = (v: readonly [number, number, number]): [number, number, number] => [v[0] + at.x, v[1] + at.y, v[2] + at.z];
  void director.shot({ pos: rel(COVER_SHOT.from), look: rel(COVER_SHOT.look) });
  void director.shot({ pos: rel(COVER_SHOT.to), look: rel(COVER_SHOT.look), ms: COVER_SHOT.ms });
  const cover = el('section', 'cover', undefined, shell);
  el('span', 'kick', t('kicker'), cover);
  el('h1', '', t('title'), cover);
  el('p', '', t('mystery'), cover);
  const open = button('btn wait', t('ui.answerSignal'), () => {
    void (async () => {
      audio.init();
      audio.play('radio');
      cover.remove();
      skip.hidden = false;
      await session.wait(timeline.run(session));
      skip.hidden = true;
      showEnd(episode, shell);
    })();
  }, cover);
  open.focus();
}

/** After the last page: the patch, the real numbers, and the extras. */
function showEnd(episode: EpisodeDef, shell: HTMLElement): void {
  const end = el('section', 'endcard', undefined, shell);
  const earned = progress.isDone(episode.id);
  el('div', 'end-patch', undefined, end).appendChild(patchNode(episode, earned));
  const body = el('div', 'end-body', undefined, end);
  el('h2', '', t(earned ? 'ui.end.earned' : 'ui.end.title'), body);
  el('p', '', t('ui.end.line'), body);
  if (episode.stats) {
    const list = el('ul', 'facts', undefined, body);
    for (const stat of episode.stats) {
      const item = el('li', '', undefined, list);
      el('b', '', stat.value, item);
      item.append(t(stat.label));
    }
  }
  const acts = el('div', 'end-acts', undefined, body);
  const lookUp = episode.lookUp;
  if (lookUp) {
    button('btn alt', t('ui.sky.open'), () => {
      const overlay = el('div', 'overlay', undefined, shell);
      overlay.appendChild(skyTonightCard(lookUp));
      button('btn', t('ui.close'), () => overlay.remove(), overlay);
    }, acts);
  }
  link('btn alt', t('ui.shelf'), '#shelf', acts);
  button('btn alt', t('ui.again'), () => go(location.hash), acts);
  link('btn alt', t('ui.home'), '#home', acts);
}
