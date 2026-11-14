/**
 * About and Sources: every place our data comes from, and where it is used. Built from the same
 * lists the app uses (src/data/sources.ts, the explorer rosters, each episode's facts.json), so
 * it cannot drift from what is on screen.
 */
import { CHALLENGE_PAGE, CHALLENGE_RESOURCES, NASA_3D_RESOURCES, OTHER_SOURCES, type Source } from '../data/sources';
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

export const aboutPage: Page = (root) => {
  const inner = pageShell(root, 'about');
  const about = el('div', 'about', undefined, inner);
  el('h1', 'title', t('ui.about'), about);
  el('p', 'lede', t('ui.about.what'), about);

  el('h3', '', t('ui.about.challenge'), about);
  const intro = el('p', '', `${t('ui.about.challengeNote')} `, about);
  link('', t('ui.about.challengeLink'), CHALLENGE_PAGE, intro);
  sourceList(about, CHALLENGE_RESOURCES);

  el('h3', '', t('ui.about.models'), about);
  const models = el('p', '', `${t('ui.about.modelsNote')} `, about);
  link('', 'science.nasa.gov/3d-resources', 'https://science.nasa.gov/3d-resources/', models);
  sourceList(about, NASA_3D_RESOURCES);

  el('h3', '', t('ui.about.other'), about);
  sourceList(about, OTHER_SOURCES);

  el('h3', '', t('ui.about.explorers'), about);
  for (const destination of ['mars', 'moon'] as const) {
    const list = el('ul', 'sources', undefined, about);
    for (const e of explorersOf(destination)) {
      const item = el('li', '', `${e.name}: `, list);
      e.sources.forEach((s, i) => {
        if (i > 0) item.append(', ');
        link('', s.label, s.url, item);
      });
    }
  }

  el('h3', '', t('ui.about.sources'), about);
  el('p', '', t('ui.about.sourcesNote'), about);
  for (const episode of episodes) {
    const facts = factsOf(episode.id);
    if (facts.length === 0) continue;
    el('h2', 'section', tEp(episode.id, 'title'), about);
    const list = el('ul', 'sources', undefined, about);
    for (const fact of facts) {
      const item = el('li', '', `${fact.text} `, list);
      if (/^https?:/.test(fact.source)) link('', fact.sourceName, fact.source, item);
      else item.append(fact.sourceName);
    }
  }

  el('h3', '', t('ui.about.credits'), about);
  const libs = el('ul', 'sources', undefined, about);
  for (const [name, url] of LIBRARIES) link('', name, url, el('li', '', undefined, libs));

  el('h3', '', t('ui.about.ai'), about);
  el('p', '', t('ui.about.aiNote'), about);
  el('p', '', t('ui.about.disclaimer'), about);
};
