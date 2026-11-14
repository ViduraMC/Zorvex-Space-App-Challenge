/**
 * resourceManage: keep a meter (power, fuel, heat) above zero until time runs out, using a few
 * actions with cooldowns while scripted events help or hurt. The machine's eyes dim with the
 * meter, so the child can see how it is doing.
 */
import type { SoundName } from '../audio';
import type { BaseGameConfig, MiniGame } from './kit';

export interface ResourceManageConfig extends BaseGameConfig {
  /** Seconds to survive. */
  seconds: number;
  /** Meter at the start, 0..1. */
  start: number;
  /** Meter lost per second. */
  drainPerSecond: number;
  /** Name of the meter ("Power"). */
  meterLabel: string;
  actions: {
    label: string;
    /** Meter gained, 0..1. */
    gain: number;
    /** Seconds before the action can be used again. */
    cooldown: number;
    sfx?: string;
  }[];
  /** Things that happen at fixed times (a dust devil cleans the panels, a storm rolls in). */
  events?: { at: number; label: string; delta: number; sfx?: string; sound?: SoundName }[];
  /** i18n key with {n}: a clock in story units ("Sol {n}"). */
  clockLabel?: string;
  /** Story units that pass during the whole game (for the clock). */
  clockSpan?: number;
}

export const resourceManage: MiniGame<ResourceManageConfig> = async ({ ctx, scope, hud }, cfg) => {
  const { machine, t, audio, comic } = ctx;
  let level = cfg.start;
  let clock = 0;
  let eventIndex = 0;
  const events = [...(cfg.events ?? [])].sort((a, b) => a.at - b.at);
  const powerBefore = machine.power;
  scope.add(() => {
    machine.power = powerBefore;
  });

  const meter = scope.el('div', 'g-meter', hud.panel);
  scope.el('span', 'g-meter-label', meter, t(cfg.meterLabel));
  const fill = scope.el('div', 'g-meter-fill', meter);

  const cooldowns = cfg.actions.map(() => 0);
  const buttons = cfg.actions.map((action, i) =>
    hud.button(t(action.label), () => {
      if (cooldowns[i] > 0) return;
      hud.hintDone();
      level = Math.min(1, level + action.gain);
      cooldowns[i] = action.cooldown;
      audio.play('pop');
      if (action.sfx) comic.sfx(t(action.sfx));
    }),
  );

  return new Promise<void>((resolve) => {
    scope.frame((dt) => {
      clock += dt;
      level -= cfg.drainPerSecond * dt;
      while (eventIndex < events.length && clock >= events[eventIndex].at) {
        const e = events[eventIndex++];
        level = Math.max(0, Math.min(1, level + e.delta));
        hud.toast(t(e.label), e.delta >= 0 ? 'good' : 'oops');
        if (e.sfx) comic.sfx(t(e.sfx));
        audio.play(e.sound ?? (e.delta >= 0 ? 'ping' : 'thud'));
      }
      cooldowns.forEach((c, i) => {
        cooldowns[i] = Math.max(0, c - dt);
        buttons[i].disabled = cooldowns[i] > 0;
      });
      if (level <= 0) {
        // funny fail, instant restart
        hud.fail('ui.sfx.zzz', 'ui.play.resource.empty');
        level = cfg.start;
        clock = 0;
        eventIndex = 0;
      }
      fill.style.width = `${Math.max(0, level) * 100}%`;
      meter.classList.toggle('low', level < 0.25);
      machine.power = 0.15 + Math.max(0, level) * 0.85;
      if (cfg.clockLabel) {
        hud.status(t(cfg.clockLabel, { n: Math.max(1, Math.round((clock / cfg.seconds) * (cfg.clockSpan ?? cfg.seconds))) }));
      }
      hud.progress(clock / cfg.seconds);
      if (clock >= cfg.seconds) resolve();
    });
  });
};
