/**
 * balance: keep a wobbling value inside the green band for long enough.
 *  - input "hold": press to push the value up, release to let it fall (rotor speed, thrust).
 *  - input "drag": slide left and right against a drifting push (sunlight pressure, wind).
 * The gauge can show a real unit (value × unitMax), and the machine can rise with the value.
 */
import { vnoise } from '../noise';
import type { BaseGameConfig, MiniGame } from './kit';

export interface BalanceConfig extends BaseGameConfig {
  input: 'hold' | 'drag';
  /** Seconds the value must spend inside the band in total. */
  holdSeconds: number;
  /** The green zone on the 0..1 gauge. */
  band: [number, number];
  /** How fast the child's input moves the value (gauge units per second). */
  push: number;
  /** hold only: how fast the value falls when released. */
  fall?: number;
  /** Strength of the random drift the child fights against. */
  wobble: number;
  /** Text on the hold button / above the slider. */
  controlLabel: string;
  /** i18n key with {n} for the readout, e.g. "{n} turns per minute". */
  readout?: string;
  /** The real number at the top of the gauge (readout shows value × unitMax). */
  unitMax?: number;
  /** Lift the machine by up to this many metres as the value rises (flight!). */
  lift?: number;
}

const DRAIN = 0.5;

export const balance: MiniGame<BalanceConfig> = async ({ ctx, scope, hud }, cfg) => {
  const { machine, t } = ctx;
  let value = cfg.input === 'hold' ? 0.05 : 0.5;
  let input = 0;
  let inBand = 0;
  let clock = 0;
  let sinceFail = 0;

  const gauge = scope.el('div', 'g-gauge', hud.panel);
  const band = scope.el('div', 'g-gauge-band', gauge);
  band.style.bottom = `${cfg.band[0] * 100}%`;
  band.style.height = `${(cfg.band[1] - cfg.band[0]) * 100}%`;
  const marker = scope.el('div', 'g-gauge-marker', gauge);
  const readout = scope.el('div', 'g-readout', hud.panel);

  if (cfg.input === 'hold') {
    const btn = scope.el('button', 'btn hold-btn wait', hud.panel, t(cfg.controlLabel));
    btn.type = 'button';
    const press = (): void => {
      input = cfg.push;
      hud.hintDone();
    };
    const release = (): void => {
      input = -(cfg.fall ?? cfg.push);
    };
    release();
    scope.listen(btn, 'pointerdown', (e) => {
      btn.setPointerCapture(e.pointerId);
      press();
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) scope.listen(btn, type, release);
    scope.listen(btn, 'keydown', (e) => (e.key === ' ' || e.key === 'Enter') && press());
    scope.listen(btn, 'keyup', release);
    scope.listen(btn, 'contextmenu', (e) => e.preventDefault());
  } else {
    const label = scope.el('label', 'g-slider', hud.panel, t(cfg.controlLabel));
    const slider = scope.el('input', '', label);
    slider.type = 'range';
    slider.min = '-1';
    slider.max = '1';
    slider.step = '0.01';
    slider.value = '0';
    slider.addEventListener('input', () => {
      input = Number(slider.value) * cfg.push;
      hud.hintDone();
    });
  }
  scope.add(() => {
    machine.lift = 0;
  });

  return new Promise<void>((resolve) => {
    scope.frame((dt) => {
      clock += dt;
      sinceFail += dt;
      const drift = (vnoise(clock * 0.9, 3.7) - 0.5) * 2 * cfg.wobble;
      value = Math.max(0, Math.min(1, value + (input + drift) * dt));
      const ok = value >= cfg.band[0] && value <= cfg.band[1];
      inBand = Math.max(0, inBand + (ok ? dt : -dt * DRAIN));
      // slamming into either end is the funny fail; the grace period avoids a fail every frame
      if ((value >= 1 || (value <= 0 && cfg.input === 'drag')) && sinceFail > 1.5) {
        sinceFail = 0;
        hud.fail('ui.sfx.wobble', 'ui.play.balance.steady');
        value = (cfg.band[0] + cfg.band[1]) / 2;
      }
      marker.style.bottom = `${value * 100}%`;
      gauge.classList.toggle('ok', ok);
      if (cfg.readout) readout.textContent = t(cfg.readout, { n: Math.round(value * (cfg.unitMax ?? 100)) });
      if (cfg.lift) machine.lift = Math.max(0, value - cfg.band[0] * 0.5) * cfg.lift;
      hud.progress(inBand / cfg.holdSeconds);
      if (inBand >= cfg.holdSeconds) resolve();
    });
  });
};
