/** The shell shared by the hub, the shelf and the About page: star field, top bar, language switch. */
import { CONFIG, type Lang } from '../config';
import { button, el, link } from '../dom';
import { audio } from '../engine/audio';
import { getLang, setLang, t } from '../engine/i18n';
import { go } from '../engine/router';

/** Each language named in its own script. */
const LANG_NAMES: Record<Lang, string> = { en: 'English', si: 'සිංහල', ta: 'தமிழ்' };

/** Re-open the current screen so every label is drawn again in the new language. */
const reopen = (): void => go(location.hash || '#home');

/**
 * A compact language picker for screens with little room (the journey, the story player, Anatomy).
 * By default the screen reopens in the new language; a screen that must keep its place passes onChange.
 */
export function langSelect(parent: HTMLElement, className: string, onChange: () => void = reopen): HTMLSelectElement {
  const select = el('select', className, undefined, parent);
  select.setAttribute('aria-label', t('ui.lang'));
  select.title = t('ui.lang');
  for (const lang of CONFIG.langs) {
    const option = el('option', '', LANG_NAMES[lang], select);
    option.value = lang;
    option.lang = lang;
    option.selected = lang === getLang();
  }
  select.addEventListener('change', () => {
    setLang(select.value as Lang);
    onChange();
  });
  return select;
}

/** Sound on or off, remembered on this device. */
export function soundToggle(parent: HTMLElement, className: string): HTMLButtonElement {
  const b = button(className, t('ui.sound'), () => {
    const on = !audio.soundOn;
    audio.setSound(on);
    b.setAttribute('aria-pressed', String(on));
  }, parent);
  b.setAttribute('aria-pressed', String(audio.soundOn));
  return b;
}

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
  const langs = el('div', 'lang-chips', undefined, nav);
  langs.setAttribute('role', 'group');
  langs.setAttribute('aria-label', t('ui.lang'));
  for (const lang of CONFIG.langs) {
    const b = button('chip', LANG_NAMES[lang], () => {
      setLang(lang);
      reopen();
    }, langs);
    b.lang = lang;
    b.setAttribute('aria-pressed', String(lang === getLang()));
  }
  return inner;
}
