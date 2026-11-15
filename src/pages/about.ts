/**
 * About and Sources: every place our data comes from, and where it is used. Built from the same
 * lists the app uses (src/data/sources.ts, the explorer rosters, each episode's facts.json), so
 * it cannot drift from what is on screen.
 */
import { CHALLENGE_PAGE, CHALLENGE_RESOURCES, NASA_3D_RESOURCES, OTHER_SOURCES, STORY_SOURCES, type Source } from '../data/sources';
import { el, link } from '../dom';
import { t, tEp } from '../engine/i18n';
import type { Page } from '../engine/router';
import { episodes, factsOf } from '../episodes';
import { explorersOf } from '../journey/explorers';
import { pageShell } from './chrome';

/** Code libraries (no data). Licences are in docs/CREDITS.md. */
const LIBRARIES: [string, string][] = [
  ['three.js', 'https://threejs.org/'],
  ['pmndrs/postprocessing', 'https://github.com/pmndrs/postprocessing'],
  ['camera-controls', 'https://github.com/yomotsu/camera-controls'],
  ['GSAP', 'https://gsap.com/'],
  ['three.quarks', 'https://github.com/Alchemist0823/three.quarks'],
  ['Astronomy Engine (computes where Mars and the Moon are tonight)', 'https://github.com/cosinekitty/astronomy'],
];

function sourceList(parent: HTMLElement, sources: Source[]): void {
  const list = el('ul', 'sources', undefined, parent);
  for (const s of sources) {
    const item = el('li', '', undefined, list);
    link('', s.label, s.url, item);
    item.append(` · ${s.usedFor}`);
  }
}

/** A collapsible section: a whole list at a glance, opened only when someone wants the detail. */
function section(parent: HTMLElement, title: string): HTMLElement {
  const box = el('details', 'lib-section', undefined, parent);
  el('summary', '', title, box);
  return box;
}

export const aboutPage: Page = (root) => {
  const inner = pageShell(root, 'about');
  const about = el('div', 'about', undefined, inner);
  el('h1', 'title', t('ui.about'), about);
  el('p', 'lede', t('ui.about.what'), about);

  // 1. One card per machine: where its facts come from, and a way into its story
  el('h2', 'lib-heading', t('ui.about.byMachine'), about);
  el('p', 'lib-note', t('ui.about.byMachineNote'), about);
  const grid = el('div', 'lib-grid', undefined, about);
  for (const episode of episodes) {
    const facts = factsOf(episode.id);
    if (facts.length === 0) continue;
    const card = el('details', 'lib-card', undefined, grid);
    card.style.setProperty('--patch', episode.patch.color);
    const head = el('summary', '', undefined, card);
    el('span', 'lib-badge', episode.patch.glyph, head);
    const name = el('span', 'lib-name', undefined, head);
    el('b', '', tEp(episode.id, 'title'), name);
    el('small', '', t('ui.about.factCount', { n: facts.length }), name);
    const acts = el('div', 'lib-acts', undefined, card);
    link('chip', `▶ ${t('ui.about.play')}`, `#ep-${episode.id}`, acts);
    if (episode.anatomy) link('chip', t('ui.parts.open'), `#parts-${episode.anatomy}`, acts);
    const pages = new Map(facts.filter((f) => /^https?:/.test(f.source)).map((f) => [f.source, f.sourceName]));
    for (const [url, label] of pages) link('chip lib-src', `↗ ${label}`, url, acts);
    const list = el('ol', 'lib-facts', undefined, card);
    for (const fact of facts) el('li', '', fact.text, list);
  }

  // 2. Everything else, folded away until someone opens it
  const challenge = section(about, t('ui.about.challenge'));
  const intro = el('p', '', `${t('ui.about.challengeNote')} `, challenge);
  link('', t('ui.about.challengeLink'), CHALLENGE_PAGE, intro);
  sourceList(challenge, CHALLENGE_RESOURCES);

  const models = section(about, t('ui.about.models'));
  const modelsNote = el('p', '', `${t('ui.about.modelsNote')} `, models);
  link('', 'science.nasa.gov/3d-resources', 'https://science.nasa.gov/3d-resources/', modelsNote);
  sourceList(models, NASA_3D_RESOURCES);

  sourceList(section(about, t('ui.about.story')), STORY_SOURCES);
  sourceList(section(about, t('ui.about.other')), OTHER_SOURCES);

  const dates = section(about, t('ui.about.explorers'));
  for (const destination of ['mars', 'moon'] as const) {
    const list = el('ul', 'sources', undefined, dates);
    for (const e of explorersOf(destination)) {
      const item = el('li', '', `${e.name}: `, list);
      e.sources.forEach((src, i) => {
        if (i > 0) item.append(', ');
        link('', src.label, src.url, item);
      });
    }
  }

  const libs = el('ul', 'sources', undefined, section(about, t('ui.about.credits')));
  for (const [name, url] of LIBRARIES) link('', name, url, el('li', '', undefined, libs));

  el('p', '', t('ui.about.aiNote'), section(about, t('ui.about.ai')));
  el('p', 'lib-note', t('ui.about.disclaimer'), about);
};
