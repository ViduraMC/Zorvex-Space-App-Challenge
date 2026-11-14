/**
 * seismograph: a seismometer line scrolls past; tap RECORD while it shakes, and the whole scene
 * jolts with each burst. For machines that listened to the ground (ALSEP, InSight).
 * The bursts are the game's picture of shaking, not a measured trace.
 */
import type { BaseGameConfig, MiniGame } from './kit';

export interface SeismographConfig extends BaseGameConfig {
  tapLabel: string;
  /** Sound-effect word shown when the ground shakes. */
  burstSfx: string;
  /** Message for a tap while the line is calm. */
  calmLabel: string;
  /** Toast for a good recording. */
  gotLabel: string;
  /** Good recordings needed to win. */
  rounds: number;
}

const W = 640;
const H = 160;
const SCROLL_S = 4;
const SHAKE_S = 2.2;
/** How far the whole scene jolts at the peak of a burst (metres). */
const JOLT = 0.06;

export const seismograph: MiniGame<SeismographConfig> = ({ ctx, scope, hud }, cfg) => {
  const { t, audio, comic, scene } = ctx;
  const canvas = scope.el('canvas', 'g-scope', hud.panel);
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d')!;
  const css = getComputedStyle(canvas);
  const ink = css.getPropertyValue('--game-line').trim() || '#FFD84A';
  let clock = 0;
  let hits = 0;
  let next = 2.5;
  /** Start times of every burst so far, so the trace keeps them as they scroll away. */
  const bursts: number[] = [];
  let recorded = -1;
  scope.add(() => scene.position.set(0, 0, 0));
  hud.status(t('ui.play.count', { n: 0, total: cfg.rounds }));

  const strength = (time: number): number => {
    let s = 0;
    for (const b of bursts) {
      const k = time - b;
      if (k > 0 && k < SHAKE_S) s = Math.max(s, Math.sin((k / SHAKE_S) * Math.PI) * (1 - k / (SHAKE_S * 2)));
    }
    return s;
  };

  return new Promise<void>((win) => {
    const record = (): void => {
      hud.hintDone();
      const last = bursts[bursts.length - 1];
      const live = last != null && clock - last < SHAKE_S && recorded !== last;
      if (!live) {
        hud.fail('ui.sfx.nope', cfg.calmLabel);
        return;
      }
      recorded = last;
      hits++;
      audio.play('ping');
      hud.toast(t(cfg.gotLabel));
      hud.status(t('ui.play.count', { n: hits, total: cfg.rounds }));
      hud.progress(hits / cfg.rounds);
      if (hits >= cfg.rounds) setTimeout(win, 600);
    };
    const button = scope.el('button', 'btn tap-btn wait', hud.panel, t(cfg.tapLabel));
    button.type = 'button';
    button.addEventListener('pointerdown', record);
    scope.listen(button, 'keydown', (e) => (e.key === ' ' || e.key === 'Enter') && record());

    scope.frame((dt) => {
      clock += dt;
      if (clock > next) {
        bursts.push(clock);
        next = clock + SHAKE_S + 1.5 + Math.random() * 2.5;
        audio.play('thud');
        comic.sfx(t(cfg.burstSfx));
      }
      const now = strength(clock);
      scene.position.set((Math.random() - 0.5) * JOLT * now, (Math.random() - 0.5) * JOLT * 0.5 * now, 0);
      g.clearRect(0, 0, W, H);
      g.lineWidth = 3;
      g.strokeStyle = ink;
      g.beginPath();
      for (let x = 0; x <= W; x += 3) {
        const time = clock - ((W - x) / W) * SCROLL_S;
        const s = strength(time);
        const y = H / 2 + Math.sin(time * 37) * 2 + Math.sin(time * 91 + x) * (2 + s * (H * 0.42));
        if (x === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
    });
  });
};
