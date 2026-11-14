/**
 * holdToScan: tap a target, the machine goes to it, then HOLD until the scan bar fills.
 * Letting go early drains the bar. Each finished scan reveals what the machine found.
 */
import type { Target } from '../types';
import { pin, type BaseGameConfig, type MiniGame } from './kit';

export interface HoldToScanConfig extends BaseGameConfig {
  targets: {
    at: Target;
    /** Name shown on the target. */
    label: string;
    /** What the machine says when the scan is done, and the fact id behind it. */
    say: string;
    fact: string | null;
    /** How close the machine stops (metres). */
    standoff?: number;
    /** Height of the label above the target (metres). */
    labelLift?: number;
  }[];
  /** Seconds of holding for one scan. */
  holdSeconds: number;
  /** Scans needed to win (default: every target). */
  need?: number;
  /** Driving pace to each target; omit when the machine should stay put. */
  msPerMetre?: number;
  /** Text on the hold button (default "ui.play.scan.hold"). */
  holdLabel?: string;
}

const DRAIN_SPEED = 1.5;
const DEFAULT_STANDOFF = 0.6;

export const holdToScan: MiniGame<HoldToScanConfig> = async (api, cfg) => {
  const { ctx, scope, hud } = api;
  const { machine, t, audio, comic } = ctx;
  const need = cfg.need ?? cfg.targets.length;
  let done = 0;
  let busy = false;
  let finish: () => void = () => undefined;
  hud.status(t('ui.play.count', { n: 0, total: need }));

  /** Show the hold button and resolve once the bar has been filled. */
  const hold = (): Promise<void> =>
    new Promise<void>((resolve) => {
      const phase = scope.child();
      const btn = phase.el('button', 'btn hold-btn wait', hud.panel, t(cfg.holdLabel ?? 'ui.play.scan.hold'));
      btn.type = 'button';
      let holding = false;
      let p = 0;
      const press = (): void => {
        holding = true;
      };
      const release = (): void => {
        if (holding && p > 0.15 && p < 1) hud.toast(t('ui.play.scan.steady'), 'oops');
        holding = false;
      };
      phase.listen(btn, 'pointerdown', (e) => {
        btn.setPointerCapture(e.pointerId);
        press();
      });
      for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) phase.listen(btn, type, release);
      phase.listen(btn, 'keydown', (e) => (e.key === ' ' || e.key === 'Enter') && press());
      phase.listen(btn, 'keyup', release);
      phase.listen(btn, 'contextmenu', (e) => e.preventDefault());
      phase.add(() => {
        audio.rise(null);
        machine.talking = false;
      });
      phase.frame((dt) => {
        p = Math.max(0, p + (holding ? dt / cfg.holdSeconds : (-dt * DRAIN_SPEED) / cfg.holdSeconds));
        hud.progress(p);
        audio.rise(holding ? p : null);
        machine.talking = holding;
        btn.classList.toggle('holding', holding);
        if (p >= 1) {
          phase.dispose();
          resolve();
        }
      });
    });

  for (const target of cfg.targets) {
    const label = scope.el('button', 'pin-btn', comic.pinHost, t(target.label));
    label.type = 'button';
    pin(api, label, target.at, target.labelLift ?? 0.4);
    label.addEventListener('click', () => {
      void (async () => {
        if (busy || label.classList.contains('done')) return;
        busy = true;
        hud.hintDone();
        const p = ctx.resolve(target.at).clone();
        if (cfg.msPerMetre) {
          const dx = p.x - machine.x;
          const dz = p.z - machine.z;
          const dist = Math.hypot(dx, dz);
          const standoff = target.standoff ?? DEFAULT_STANDOFF;
          if (dist > standoff + 0.05) {
            comic.sfx(t('ui.sfx.whirr'));
            const k = (dist - standoff) / dist;
            await scope.wait(machine.driveTo(machine.x + dx * k, machine.z + dz * k, (dist - standoff) * cfg.msPerMetre));
          }
        }
        await scope.wait(hold());
        label.classList.add('done');
        done++;
        audio.play('ping');
        comic.sfx(t('ui.sfx.beep'));
        ctx.fx.burst('sparkle', p);
        hud.progress(0);
        hud.status(t('ui.play.count', { n: done, total: need }));
        await ctx.say(target.say, scope);
        comic.hideBubble();
        busy = false;
        if (done >= need) finish();
      })();
    });
  }

  return new Promise<void>((resolve) => {
    finish = resolve;
  });
};
