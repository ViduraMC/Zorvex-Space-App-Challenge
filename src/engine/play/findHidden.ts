/**
 * findHidden: tap the hidden things in the 3D scene. Wrong taps get a funny miss, and after
 * a quiet spell one item starts to pulse, so nobody gets stuck.
 */
import { Vector3 } from 'three';
import { CONFIG } from '../../config';
import type { Target } from '../types';
import { onTap, pin, type BaseGameConfig, type MiniGame } from './kit';

export interface FindHiddenConfig extends BaseGameConfig {
  /** The things to find: scene object names or positions. */
  items: Target[];
  /** Look-alikes that are NOT it; tapping one gives a funny miss. */
  decoys?: Target[];
  /** How many must be found (default: all). */
  need?: number;
  /** Sound-effect word for a find (default "ui.sfx.found"). */
  foundSfx?: string;
  /** Sound-effect word and cheer-up line for tapping a decoy. */
  missSfx?: string;
  missSay?: string;
  /** Let the child orbit the camera to search (distance limits in metres). */
  orbit?: { min: number; max: number };
  /** Seconds without a find before a helping pulse appears (default 9). */
  helpAfter?: number;
}

const DEFAULT_HELP_AFTER_S = 9;

export const findHidden: MiniGame<FindHiddenConfig> = async (api, cfg) => {
  const { ctx, scope, hud } = api;
  const { t, audio, comic } = ctx;
  const items = cfg.items.map((at) => ({ at, found: false }));
  const need = cfg.need ?? items.length;
  let found = 0;
  let quiet = 0;
  let finish: () => void = () => undefined;
  const point = new Vector3();
  hud.status(t('ui.play.count', { n: 0, total: need }));
  if (cfg.orbit) ctx.director.orbit(ctx.resolve(items[0].at), cfg.orbit.min, cfg.orbit.max);

  /** Screen distance from a tap to a target (Infinity when it is behind the camera). */
  const reach = (at: Target, x: number, y: number): number => {
    const s = ctx.project(ctx.resolve(at, point));
    return s.visible ? Math.hypot(s.x - x, s.y - y) : Infinity;
  };

  onTap(api, (x, y) => {
    hud.hintDone();
    const hit = items
      .filter((i) => !i.found)
      .map((i) => ({ i, d: reach(i.at, x, y) }))
      .sort((a, b) => a.d - b.d)[0];
    if (hit && hit.d < CONFIG.tapRadiusPx) {
      hit.i.found = true;
      found++;
      quiet = 0;
      ctx.fx.burst('sparkle', ctx.resolve(hit.i.at, point));
      audio.play('ping');
      comic.sfx(t(cfg.foundSfx ?? 'ui.sfx.found'));
      pin(api, scope.el('div', 'g-found', comic.pinHost, '✓'), hit.i.at);
      hud.status(t('ui.play.count', { n: found, total: need }));
      hud.progress(found / need);
      if (found >= need) finish();
      return;
    }
    if ((cfg.decoys ?? []).some((d) => reach(d, x, y) < CONFIG.tapRadiusPx)) {
      hud.fail(cfg.missSfx ?? 'ui.sfx.nope', cfg.missSay ?? 'ui.play.find.miss');
      return;
    }
    // a plain miss still answers the tap
    audio.play('tick');
    const ripple = scope.el('div', 'g-ripple', comic.pinHost);
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.addEventListener('animationend', () => ripple.remove());
  });

  scope.frame((dt) => {
    quiet += dt;
    if (quiet < (cfg.helpAfter ?? DEFAULT_HELP_AFTER_S)) return;
    quiet = 0;
    const next = items.find((i) => !i.found);
    if (!next) return;
    const pulse = scope.el('div', 'g-help', comic.pinHost);
    pin(api, pulse, next.at);
    pulse.addEventListener('animationend', () => pulse.remove());
  });

  return new Promise<void>((resolve) => {
    finish = resolve;
  });
};
