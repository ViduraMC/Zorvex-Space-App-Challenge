/** The patch shelf: every mission patch, earned ones in colour. Progress is saved on this device only. */
import { el, link } from '../dom';
import { t, tEp } from '../engine/i18n';
import { progress } from '../engine/progress';
import type { Page } from '../engine/router';
import { episodes } from '../episodes';
import { pageShell } from '../pages/chrome';
import { patchNode } from './patch';

export const shelfPage: Page = (root) => {
  const inner = pageShell(root, 'shelf');
  el('h1', 'title', t('ui.shelf'), inner);
  const earned = episodes.filter((e) => progress.isDone(e.id)).length;
  el('p', 'lede', t('ui.shelf.count', { n: earned, total: episodes.length }), inner);
  const grid = el('div', 'shelf-grid', undefined, inner);
  for (const episode of episodes) {
    const done = progress.isDone(episode.id);
    const item = link('shelf-item', '', `#ep-${episode.id}`, grid);
    item.appendChild(patchNode(episode, done));
    el('div', '', done ? tEp(episode.id, 'title') : t('ui.shelf.locked'), item);
  }
};
