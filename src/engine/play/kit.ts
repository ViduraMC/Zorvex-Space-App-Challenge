/**
 * Shared frame for every mini-game: the one-line goal, the tutorial hint, a progress bar,
 * instant feedback toasts, the funny-fail reaction and the win moment. A game only writes its
 * own rules; the fun rules (docs/FUN_CHECKLIST.md) are enforced here once.
 */
import gsap from 'gsap';
import { DoubleSide, Mesh, MeshBasicMaterial, Raycaster, RingGeometry, Vector2, Vector3 } from 'three';
import type { Scope } from '../scope';
import type { EpisodeContext, Target, Vec3 } from '../types';

/** Fields every mini-game config has. All text values are i18n keys. */
export interface BaseGameConfig {
  /** One line telling the child what to do. */
  goal: string;
  /** Tutorial hint shown under the goal until the first action. */
  hint: string;
  /** Sound-effect word for the win (default "ui.sfx.win"). */
  winSfx?: string;
  /** The machine's reaction line after a win, and the fact it rests on (null = pure feeling). */
  winSay?: string;
  winFact?: string | null;
  /** Camera for the play moment. */
  camera?: { pos: Vec3; look: Vec3 };
}

export interface GameApi {
  ctx: EpisodeContext;
  /** Ends when the game is won or skipped; put every listener, element and timer in it. */
  scope: Scope;
  hud: GameHud;
}

/** A mini-game resolves when the child wins. Skip is handled outside the game. */
export type MiniGame<C extends BaseGameConfig> = (api: GameApi, config: C) => Promise<void>;

const HINT_FADE_S = 0.4;
const TOAST_MS = 1500;

export class GameHud {
  /** Where a game puts its own controls (bottom of the screen, thumb reach). */
  readonly panel: HTMLDivElement;
  readonly #scope: Scope;
  readonly #ctx: EpisodeContext;
  readonly #hint: HTMLDivElement;
  readonly #status: HTMLDivElement;
  readonly #bar: HTMLDivElement;
  readonly #toastHost: HTMLDivElement;
  readonly #buttons: HTMLDivElement;

  constructor(ctx: EpisodeContext, scope: Scope, config: BaseGameConfig) {
    this.#ctx = ctx;
    this.#scope = scope;
    const host = ctx.comic.gameHost;
    const top = scope.el('div', 'g-top', host);
    scope.el('div', 'g-goal', top, ctx.t(config.goal));
    this.#hint = scope.el('div', 'g-hint', top, ctx.t(config.hint));
    this.#status = scope.el('div', 'g-status', top);
    const track = scope.el('div', 'g-bar', top);
    track.hidden = true;
    this.#bar = scope.el('div', 'g-bar-fill', track);
    this.#toastHost = scope.el('div', 'g-toasts', host);
    this.panel = scope.el('div', 'g-panel', host);
    this.#buttons = scope.el('div', 'g-buttons', host);
    gsap.from(top, { y: -30, opacity: 0, duration: 0.3, ease: 'power2.out' });
  }

  /** Call on the child's first real action: the tutorial hint has done its job. */
  hintDone(): void {
    gsap.to(this.#hint, { opacity: 0, height: 0, duration: HINT_FADE_S });
  }

  /** Short live readout under the goal ("Signal: 3 s", "2 of 3 found"). */
  status(text: string): void {
    this.#status.textContent = text;
  }

  /** Progress 0..1; the bar appears on first use. */
  progress(p: number): void {
    (this.#bar.parentElement as HTMLElement).hidden = false;
    this.#bar.style.width = `${Math.max(0, Math.min(1, p)) * 100}%`;
  }

  /** Instant payoff for an action: a short message that pops and floats away. */
  toast(text: string, kind: 'good' | 'oops' = 'good'): void {
    const el = this.#scope.el('div', `g-toast ${kind}`, this.#toastHost, text);
    gsap.fromTo(el, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(3)' });
    gsap.to(el, { y: -30, opacity: 0, duration: 0.4, delay: TOAST_MS / 1000, onComplete: () => el.remove() });
  }

  /** Funny fail: a sound-effect word, a wobble, a cheer-up line. Never a punishment. */
  fail(sfxKey: string, cheerKey = 'ui.play.tryAgain'): void {
    const { comic, audio, t } = this.#ctx;
    comic.sfx(t(sfxKey));
    audio.play('fail');
    this.toast(t(cheerKey), 'oops');
    gsap.fromTo(this.panel, { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1.2, 0.3)' });
  }

  /** Add a button to the game's button row. */
  button(label: string, onClick: () => void, className = 'btn alt'): HTMLButtonElement {
    const b = this.#scope.el('button', className, this.#buttons, label);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  }
}

const raycaster = new Raycaster();
const ndc = new Vector2();

/** The point on the ground under a screen position (null when the tap misses the terrain). */
export function groundPoint(ctx: EpisodeContext, clientX: number, clientY: number): Vector3 | null {
  if (!ctx.world.ground) return null;
  ndc.set((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(ndc, ctx.camera);
  return raycaster.intersectObject(ctx.world.ground, false)[0]?.point ?? null;
}

const TAP_MAX_MS = 350;
const TAP_MAX_MOVE_PX = 12;

/** Taps on the 3D scene. Drags (camera orbit) and long presses do not count as taps. */
export function onTap(api: GameApi, handler: (clientX: number, clientY: number) => void): void {
  let down: { x: number; y: number; at: number } | null = null;
  api.scope.listen(api.ctx.canvas, 'pointerdown', (e: PointerEvent) => {
    down = { x: e.clientX, y: e.clientY, at: performance.now() };
  });
  api.scope.listen(api.ctx.canvas, 'pointerup', (e: PointerEvent) => {
    if (!down) return;
    const quick = performance.now() - down.at < TAP_MAX_MS;
    const still = Math.hypot(e.clientX - down.x, e.clientY - down.y) < TAP_MAX_MOVE_PX;
    down = null;
    if (quick && still) handler(e.clientX, e.clientY);
  });
}

/** A gsap tween that dies with the scope. Resolves when it completes. */
export function tween(scope: Scope, target: object, vars: gsap.TweenVars): Promise<void> {
  return scope.wait(
    new Promise<void>((resolve) => {
      const tw = gsap.to(target, { ...vars, onComplete: resolve });
      scope.add(() => tw.kill());
    }),
  );
}

/** A pulsing ring lying on the ground: goals, checkpoints, danger zones. */
export function groundRing(api: GameApi, at: Vector3, radius: number, color: number): Mesh {
  const mesh = new Mesh(
    new RingGeometry(radius * 0.84, radius, 48),
    new MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: DoubleSide, depthTest: false, fog: false }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(at.x, api.ctx.world.heightAt(at.x, at.z) + 0.04, at.z);
  mesh.renderOrder = 3;
  api.ctx.scene.add(mesh);
  api.scope.add(() => {
    api.ctx.scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
  });
  api.scope.frame((_dt, time) => mesh.scale.setScalar(1 + Math.sin(time * 4) * 0.06));
  return mesh;
}

/** Keep an element on top of a world position (labels, tap targets, markers). */
export function pin(api: GameApi, el: HTMLElement, target: Target | (() => Vector3), lift = 0): void {
  const point = new Vector3();
  api.scope.frame(() => {
    if (typeof target === 'function') point.copy(target());
    else api.ctx.resolve(target, point);
    point.y += lift;
    const s = api.ctx.project(point);
    el.style.left = `${s.x}px`;
    el.style.top = `${s.y}px`;
    el.style.visibility = s.visible ? 'visible' : 'hidden';
  });
}
