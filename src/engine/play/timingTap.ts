/**
 * timingTap: tap at the right moment. Two looks:
 *  - "echo": fire a pulse, it flies out and comes back; tap when it returns. The flight time is
 *    a real number (laser light to the Moon and back takes about 2.5 s).
 *  - "dip": watch a star's brightness line and tap while it dips (a planet crossing the star).
 */
import type { BaseGameConfig, MiniGame } from './kit';

export interface TimingTapConfig extends BaseGameConfig {
  mode: 'echo' | 'dip';
  /** echo: the real round-trip time in seconds. dip: seconds between dips. */
  seconds: number;
  /** Good taps needed to win. */
  rounds: number;
  /** How far off a tap may be and still count (milliseconds). */
  toleranceMs: number;
  /** Text on the tap button. */
  tapLabel: string;
  /** echo only: text on the fire button. */
  fireLabel?: string;
  /** i18n key with {yours} and {real} (seconds), shown after a good echo. */
  resultLabel?: string;
  /** Sound-effect word for a good tap (default "ui.sfx.found"). */
  hitSfx?: string;
}

const W = 640;
const H = 160;
const DIP_LENGTH_S = 0.7;
const DIP_DEPTH = 0.42;
const SCROLL_S = 4;

export const timingTap: MiniGame<TimingTapConfig> = async ({ ctx, scope, hud }, cfg) => {
  const { t, audio, comic } = ctx;
  const canvas = scope.el('canvas', 'g-scope', hud.panel);
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d')!;
  const css = getComputedStyle(canvas);
  const ink = css.getPropertyValue('--game-line').trim() || '#FFD84A';
  const dim = css.getPropertyValue('--game-dim').trim() || 'rgba(255,255,255,.25)';
  let hits = 0;
  let clock = 0;
  /** echo: time the pulse was fired (null = waiting to fire). */
  let firedAt: number | null = null;
  /** dip: when the next dip starts. */
  let dipAt = cfg.seconds * 0.6;
  let finish: () => void = () => undefined;
  hud.status(t('ui.play.count', { n: 0, total: cfg.rounds }));

  const good = (message: string): void => {
    hits++;
    audio.play('ping');
    comic.sfx(t(cfg.hitSfx ?? 'ui.sfx.found'));
    hud.toast(message);
    hud.status(t('ui.play.count', { n: hits, total: cfg.rounds }));
    hud.progress(hits / cfg.rounds);
    if (hits >= cfg.rounds) finish();
  };

  const tap = (): void => {
    hud.hintDone();
    if (cfg.mode === 'echo') {
      if (firedAt == null) {
        firedAt = clock;
        audio.play('whoosh');
        button.textContent = t(cfg.tapLabel);
        return;
      }
      const flight = clock - firedAt;
      const error = flight - cfg.seconds;
      firedAt = null;
      button.textContent = t(cfg.fireLabel ?? cfg.tapLabel);
      if (Math.abs(error) * 1000 <= cfg.toleranceMs) {
        good(t(cfg.resultLabel ?? 'ui.play.timing.result', { yours: flight.toFixed(2), real: cfg.seconds.toFixed(2) }));
      } else {
        hud.fail('ui.sfx.oops', error < 0 ? 'ui.play.timing.early' : 'ui.play.timing.late');
      }
      return;
    }
    const sinceDip = clock - dipAt;
    const tolerance = cfg.toleranceMs / 1000;
    if (sinceDip > -tolerance && sinceDip < DIP_LENGTH_S + tolerance) {
      dipAt = clock + cfg.seconds * (0.7 + Math.random() * 0.6);
      good(t('ui.play.timing.dip'));
    } else {
      hud.fail('ui.sfx.nope', 'ui.play.timing.flicker');
    }
  };

  const button = scope.el('button', 'btn tap-btn wait', hud.panel, t(cfg.mode === 'echo' ? (cfg.fireLabel ?? cfg.tapLabel) : cfg.tapLabel));
  button.type = 'button';
  button.addEventListener('pointerdown', tap);
  scope.listen(button, 'keydown', (e) => (e.key === ' ' || e.key === 'Enter') && tap());

  /** Brightness of the star at a time: steady with a little noise, lower during a dip. */
  const brightness = (time: number): number => {
    const wobble = Math.sin(time * 9.1) * 0.03 + Math.sin(time * 23.7) * 0.02;
    const inDip = time > dipAt && time < dipAt + DIP_LENGTH_S;
    return 0.8 + wobble - (inDip ? DIP_DEPTH : 0);
  };

  scope.frame((dt) => {
    clock += dt;
    g.clearRect(0, 0, W, H);
    g.lineWidth = 4;
    g.lineCap = 'round';
    if (cfg.mode === 'echo') {
      g.strokeStyle = dim;
      g.beginPath();
      g.moveTo(30, H / 2);
      g.lineTo(W - 30, H / 2);
      g.stroke();
      if (firedAt != null) {
        // the pulse flies to the far end and back; a lost pulse resets on its own
        const p = (clock - firedAt) / cfg.seconds;
        if (p > 1.6) {
          firedAt = null;
          button.textContent = t(cfg.fireLabel ?? cfg.tapLabel);
          hud.fail('ui.sfx.oops', 'ui.play.timing.late');
        }
        const x = 30 + (W - 60) * (p <= 0.5 ? p * 2 : Math.max(0, 2 - p * 2));
        g.fillStyle = ink;
        g.beginPath();
        g.arc(x, H / 2, 12, 0, Math.PI * 2);
        g.fill();
      }
      return;
    }
    if (clock > dipAt + DIP_LENGTH_S + 1) dipAt = clock + cfg.seconds * (0.5 + Math.random() * 0.6);
    g.strokeStyle = ink;
    g.beginPath();
    for (let x = 0; x <= W; x += 6) {
      const time = clock - ((W - x) / W) * SCROLL_S;
      const y = H - brightness(time) * H;
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  });

  return new Promise<void>((resolve) => {
    finish = resolve;
  });
};
