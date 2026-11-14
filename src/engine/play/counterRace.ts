/**
 * counterRace: a counter that the child pushes far past the plan, tap by tap.
 * The plan and the real result are both true numbers (7 days planned, 83 worked; 5 flights
 * planned, 72 flown), so smashing the plan IS the lesson.
 */
import gsap from 'gsap';
import type { BaseGameConfig, MiniGame } from './kit';

export interface CounterRaceConfig extends BaseGameConfig {
  /** What the mission planned. */
  plan: number;
  /** What really happened; reaching it wins. */
  actual: number;
  /** i18n key with {n}: "Day {n}". */
  unit: string;
  /** i18n key with {n} for the plan chip: "Plan: {n} days". */
  planLabel: string;
  /** Text on the big tap button. */
  tapLabel: string;
  /** Taps needed to get from the start to `actual` (default 16). */
  taps?: number;
  /** Sound-effect word when the count passes the plan. */
  planSfx?: string;
  /** Flick the sky through day and night as the count climbs. */
  dayNight?: boolean;
}

const DEFAULT_TAPS = 16;
/** Without any taps the counter still crawls to the end, so there is no dead end. */
const SELF_FINISH_S = 45;
const DAYS_PER_SKY_CYCLE = 7;

export const counterRace: MiniGame<CounterRaceConfig> = async ({ ctx, scope, hud }, cfg) => {
  const { t, audio, comic, sky } = ctx;
  const step = Math.ceil(cfg.actual / (cfg.taps ?? DEFAULT_TAPS));
  let target = 1;
  let shown = 1;
  let pastPlan = false;

  const big = scope.el('div', 'g-counter', comic.gameHost, t(cfg.unit, { n: 1 }));
  const chip = scope.el('div', 'g-chip', comic.gameHost, t(cfg.planLabel, { n: cfg.plan }));
  const tap = scope.el('button', 'btn tap-btn wait', hud.panel, t(cfg.tapLabel));
  tap.type = 'button';
  tap.addEventListener('click', () => {
    hud.hintDone();
    target = Math.min(cfg.actual, target + step);
    audio.play('pop');
    gsap.fromTo(big, { scale: 1.18 }, { scale: 1, duration: 0.25, ease: 'back.out(3)' });
  });
  if (cfg.dayNight) gsap.killTweensOf(sky.state);

  return new Promise<void>((resolve) => {
    scope.frame((dt) => {
      target = Math.min(cfg.actual, target + (dt * cfg.actual) / SELF_FINISH_S);
      shown += (target - shown) * Math.min(1, dt * 6);
      const n = Math.min(cfg.actual, Math.round(shown));
      big.textContent = t(cfg.unit, { n });
      hud.progress(n / cfg.actual);
      if (cfg.dayNight) {
        sky.state.day = 0.5 + 0.5 * Math.cos((shown / DAYS_PER_SKY_CYCLE) * Math.PI * 2);
        sky.state.sunset = (1 - sky.state.day) ** 2 * 0.6;
      }
      if (!pastPlan && n > cfg.plan) {
        pastPlan = true;
        chip.classList.add('smashed');
        comic.sfx(t(cfg.planSfx ?? 'ui.sfx.planSmashed'));
        audio.play('win');
      }
      if (n >= cfg.actual) resolve();
    });
  });
};
