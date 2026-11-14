/** The shell shared by the hub, the shelf and the About page: star field, top bar, language switch. */
import { CONFIG, type Lang } from '../config';
import { button, el, link } from '../dom';
import { getLang, setLang, t } from '../engine/i18n';
import { go } from '../engine/router';

/** Each language named in its own script. */
const LANG_NAMES: Record<Lang, string> = { en: 'English', si: 'සිංහල', ta: 'தமிழ்' };

/** Builds the page frame and returns the element pages put their content in. */
export function pageShell(root: HTMLElement, current: 'home' | 'shelf' | 'about'): HTMLElement {
  const page = el('main', 'page', undefined, root);
  const inner = el('div', 'page-inner', undefined, page);
  const bar = el('header', 'topbar', undefined, inner);
  el('span', '', t('ui.team'), bar);
  const nav = el('nav', '', undefined, bar);
  nav.setAttribute('aria-label', t('ui.menu'));
  for (const [route, key] of [['home', 'ui.home'], ['shelf', 'ui.shelf'], ['about', 'ui.about']] as const) {
    const a = link('chip', t(key), `#${route}`, nav);
    if (route === current) a.setAttribute('aria-current', 'page');
  }
  for (const lang of CONFIG.langs) {
    const b = button('chip', LANG_NAMES[lang], () => {
      setLang(lang);
      go(location.hash || '#home');
    }, nav);
    b.lang = lang;
    b.setAttribute('aria-pressed', String(lang === getLang()));
  }
  return inner;
}
