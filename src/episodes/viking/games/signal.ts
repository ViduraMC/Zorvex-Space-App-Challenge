/**
 * Tell Earth you landed: press SEND, then wait while the signal crosses space.
 * NASA: the radio signal confirming the landing took 19 more minutes to reach Earth.
 * The wait is squeezed into a few seconds, and the screen says so.
 */
import type { BaseGameConfig, MiniGame } from '../../../engine/play';

export interface SignalConfig extends BaseGameConfig {
  /** The real one-way time in minutes. */
  minutes: number;
  /** How long the child waits. */
  seconds: number;
}

const signal: MiniGame<SignalConfig> = ({ ctx, scope, hud }, cfg) => {
  const { t, audio, comic } = ctx;
  const track = scope.el('div', 'g-signal', hud.panel);
  scope.el('span', 'g-signal-end mars', track, t('game.signal.mars'));
  const pulse = scope.el('i', 'g-signal-pulse', track);
  scope.el('span', 'g-signal-end earth', track, t('game.signal.earth'));
  let flying = false;
  let clock = 0;
  let beeps = 0;

  return new Promise<void>((win) => {
    const send = hud.button(t('game.signal.send'), () => {
      hud.hintDone();
      if (flying) {
        hud.toast(t('game.signal.patience'), 'oops');
        return;
      }
      flying = true;
      clock = 0;
      send.classList.remove('wait');
      audio.play('radio');
      comic.sfx(t('sfx.send'));
    }, 'btn wait');

    scope.frame((dt) => {
      if (!flying) return;
      clock += dt;
      const p = Math.min(1, clock / cfg.seconds);
      pulse.style.left = `${p * 100}%`;
      hud.progress(p);
      hud.status(t('game.signal.flying', { min: Math.round(p * cfg.minutes), total: cfg.minutes, sec: cfg.seconds }));
      if (clock * 2 > beeps) {
        beeps++;
        audio.play('tick');
      }
      if (p >= 1) {
        flying = false;
        audio.play('ping');
        comic.sfx(t('sfx.heard'));
        win();
      }
    });
  });
};

export default signal;
