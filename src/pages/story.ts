/**
 * Screen 4 placeholder: shown for an explorer whose story is not built yet. When an episode
 * with the same id exists in src/episodes/, the journey opens that episode instead.
 */
import { el, link } from '../dom';
import { t } from '../engine/i18n';
import { go, type Page } from '../engine/router';
import { findExplorer } from '../journey/explorers';
import { pageShell } from './chrome';

export const storyPage: Page = (root, id) => {
  const explorer = findExplorer(id);
  if (!explorer) {
    go('#home');
    return;
  }
  const inner = pageShell(root, 'home');
  el('h1', 'title', explorer.name, inner);
  const end = explorer.years.end ?? t('ui.years.present');
  el('p', 'lede', `${t(`ui.type.${explorer.type}`)} · ${explorer.years.start} – ${end} · ${t(`ui.status.${explorer.status}`)}`, inner);
  el('h2', 'section', t('ui.story.soon'), inner);
  el('p', 'lede', explorer.summary, inner);
  link('btn', t('ui.story.back'), '#home', inner);
};
