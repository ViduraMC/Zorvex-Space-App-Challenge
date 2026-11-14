/**
 * About: who made this, where every fact comes from, the NASA data and libraries used, and how
 * AI was used. The source list is generated from each episode's facts.json, so it cannot drift
 * from what the machines actually say.
 */
import { el, link } from '../dom';
import { t, tEp } from '../engine/i18n';
import type { Page } from '../engine/router';
import { episodes, factsOf } from '../episodes';
import { pageShell } from './chrome';

/** Data and code credits. Licences are recorded in docs/CREDITS.md. */
const CREDITS: [string, string][] = [
  ['NSSDCA Master Catalog, NASA Goddard', 'https://nssdc.gsfc.nasa.gov/nmc/'],
  ['HiRISE images and terrain, NASA/JPL-Caltech/UArizona', 'https://www.uahirise.org/'],
  ['NASA Science and JPL mission pages', 'https://science.nasa.gov/'],
  ['Mars global colour mosaic (Viking), NASA/JPL/USGS', 'https://astrogeology.usgs.gov/'],
  ["CGI Moon Kit (LRO and LOLA), NASA's Scientific Visualization Studio", 'https://svs.gsfc.nasa.gov/4720'],
  ['three.js', 'https://threejs.org/'],
  ['pmndrs/postprocessing', 'https://github.com/pmndrs/postprocessing'],
  ['camera-controls', 'https://github.com/yomotsu/camera-controls'],
  ['GSAP', 'https://gsap.com/'],
  ['three.quarks', 'https://github.com/Alchemist0823/three.quarks'],
  ['Astronomy Engine', 'https://github.com/cosinekitty/astronomy'],
];

export const aboutPage: Page = (root) => {
  const inner = pageShell(root, 'about');
  const about = el('div', 'about', undefined, inner);
  el('h1', 'title', t('ui.about'), about);
  el('p', 'lede', t('ui.about.what'), about);

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
  const credits = el('ul', 'sources', undefined, about);
  for (const [name, url] of CREDITS) link('', name, url, el('li', '', undefined, credits));

  el('h3', '', t('ui.about.ai'), about);
  el('p', '', t('ui.about.aiNote'), about);
  el('p', '', t('ui.about.disclaimer'), about);
};
