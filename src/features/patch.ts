/**
 * Mission patches: the collectible badge a child earns per episode. Drawn as SVG from the
 * episode's colour and glyph. Our own design: no NASA logo or insignia (Space Apps rule).
 */
import { escapeHtml } from '../dom';
import { tEp } from '../engine/i18n';
import { hash } from '../engine/noise';
import type { EpisodeDef } from '../engine/types';

const STAR_COUNT = 14;

function patchSvg(episode: EpisodeDef, earned: boolean): string {
  const title = escapeHtml(tEp(episode.id, 'title').toUpperCase());
  const team = escapeHtml(tEp(episode.id, 'ui.patch.ring'));
  const color = escapeHtml(earned ? episode.patch.color : '#8a8478');
  const seed = episode.order + 1;
  let stars = '';
  for (let i = 0; i < STAR_COUNT; i++) {
    const angle = hash(i, seed) * Math.PI * 2;
    const dist = 14 + hash(i, seed + 3) * 44;
    const r = 0.8 + hash(i, seed + 5) * 1.4;
    stars += `<circle cx="${(100 + Math.cos(angle) * dist).toFixed(1)}" cy="${(100 + Math.sin(angle) * dist).toFixed(1)}" r="${r.toFixed(1)}" fill="#fff" opacity="${earned ? 0.9 : 0.3}"/>`;
  }
  const id = `arc-${escapeHtml(episode.id)}`;
  return `<svg class="patch${earned ? ' earned' : ''}" viewBox="0 0 200 200" role="img" aria-label="${title}">
  <defs>
    <path id="${id}-top" d="M 28 100 A 72 72 0 0 1 172 100"/>
    <path id="${id}-bottom" d="M 22 100 A 78 78 0 0 0 178 100"/>
  </defs>
  <circle cx="100" cy="100" r="96" fill="${color}" stroke="#111" stroke-width="6"/>
  <circle cx="100" cy="100" r="62" fill="#0b0d1a" stroke="#111" stroke-width="5"/>
  ${stars}
  <text x="100" y="122" text-anchor="middle" font-size="62" class="patch-glyph">${earned ? escapeHtml(episode.patch.glyph) : '?'}</text>
  <text class="patch-text" font-size="17"><textPath href="#${id}-top" startOffset="50%" text-anchor="middle">${earned ? title : '? ? ?'}</textPath></text>
  <text class="patch-text" font-size="11"><textPath href="#${id}-bottom" startOffset="50%" text-anchor="middle">${team}</textPath></text>
</svg>`;
}

/** The patch as an element. Every value placed in the markup above is escaped first. */
export function patchNode(episode: EpisodeDef, earned: boolean): HTMLElement {
  const holder = document.createElement('div');
  holder.className = 'patch-holder';
  holder.innerHTML = patchSvg(episode, earned);
  return holder;
}
