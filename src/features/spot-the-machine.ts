/**
 * "Spot the machine": find the real machine in a real orbital photo (HiRISE for Mars, LROC for
 * the Moon). This is the proof that the story is true: it is still there, and here is the picture.
 */
import gsap from 'gsap';
import { button, el, link } from '../dom';
import { audio } from '../engine/audio';
import { t } from '../engine/i18n';
import type { EpisodeDef } from '../engine/types';
import { assetUrl } from '../episodes';

const MISSES_BEFORE_HELP = 3;

/** Opens the game as an overlay inside `host`. Returns a function that closes it. */
export function openSpotTheMachine(host: HTMLElement, episode: EpisodeDef): () => void {
  const spot = episode.spot;
  const url = spot && assetUrl(episode.id, spot.image);
  if (!spot || !url) return () => undefined;

  const overlay = el('div', 'overlay spot', undefined, host);
  const close = (): void => overlay.remove();
  el('h2', '', t('ui.spot.title'), overlay);
  const prompt = el('p', 'spot-prompt', t('ui.spot.prompt'), overlay);
  const frame = el('div', 'spot-frame', undefined, overlay);
  const img = el('img', '', undefined, frame);
  img.src = url;
  img.alt = t('ui.spot.alt');
  img.draggable = false;
  const ring = el('div', 'spot-ring', undefined, frame);
  ring.hidden = true;
  ring.style.left = `${spot.x * 100}%`;
  ring.style.top = `${spot.y * 100}%`;
  ring.style.width = `${spot.r * 200}%`;
  const foot = el('div', 'spot-foot', undefined, overlay);
  link('credit', t('ui.spot.credit', { credit: spot.credit }), spot.source, foot);
  button('btn', t('ui.close'), close, foot);

  let misses = 0;
  let found = false;
  frame.addEventListener('pointerdown', (e) => {
    if (found) return;
    const box = img.getBoundingClientRect();
    const x = (e.clientX - box.left) / box.width;
    const y = (e.clientY - box.top) / box.height;
    // distances are measured in image widths so the target stays round on any photo shape
    const off = Math.hypot(x - spot.x, (y - spot.y) * (box.height / box.width));
    if (off <= spot.r * 1.5) {
      found = true;
      ring.hidden = false;
      ring.classList.add('found');
      audio.play('win');
      prompt.textContent = t('ui.spot.found');
      gsap.to(img, { scale: 2.2, transformOrigin: `${spot.x * 100}% ${spot.y * 100}%`, duration: 1.2, ease: 'power2.inOut' });
      gsap.to(ring, { scale: 2.2, duration: 1.2, ease: 'power2.inOut' });
      return;
    }
    misses++;
    audio.play('tick');
    const ripple = el('div', 'g-ripple', undefined, frame);
    ripple.style.left = `${x * 100}%`;
    ripple.style.top = `${y * 100}%`;
    ripple.addEventListener('animationend', () => ripple.remove());
    prompt.textContent = t(misses >= MISSES_BEFORE_HELP ? 'ui.spot.help' : 'ui.spot.miss');
    if (misses >= MISSES_BEFORE_HELP) {
      ring.hidden = false;
      ring.classList.add('helping');
    }
  });
  return close;
}
