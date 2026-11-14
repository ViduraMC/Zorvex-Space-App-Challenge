import { CONFIG, type Lang } from '../config';
import { progress } from './progress';

type Dict = Record<string, string>;

// Shared UI text lives in src/i18n/<lang>.json; each episode brings its own i18n/<lang>.json.
const uiFiles = import.meta.glob<Dict>('../i18n/*.json', { eager: true, import: 'default' });
const epFiles = import.meta.glob<Dict>('../episodes/*/i18n/*.json', { eager: true, import: 'default' });

const ui = (lang: string): Dict | undefined => uiFiles[`../i18n/${lang}.json`];
const ep = (id: string, lang: string): Dict | undefined => epFiles[`../episodes/${id}/i18n/${lang}.json`];

let lang: Lang = progress.get().lang;
let episodeId = '';
const warned = new Set<string>();

function fill(text: string, vars?: Record<string, string | number>): string {
  return vars ? text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : text;
}

/** Translate a key from one episode's files, falling back to shared UI text, then to English. */
export function tEp(id: string, key: string, vars?: Record<string, string | number>): string {
  const fallback = CONFIG.defaultLang;
  const hit = ep(id, lang)?.[key] ?? ui(lang)?.[key] ?? ep(id, fallback)?.[key] ?? ui(fallback)?.[key];
  if (hit == null) {
    if (import.meta.env.DEV && !warned.has(key)) {
      warned.add(key);
      console.warn(`[i18n] missing key "${key}"${id ? ` (episode ${id})` : ''}`);
    }
    return key;
  }
  return fill(hit, vars);
}

/** Translate a key in the current episode (or shared UI text when no episode is open). */
export const t = (key: string, vars?: Record<string, string | number>): string => tEp(episodeId, key, vars);

export const getLang = (): Lang => lang;
export function setLang(next: Lang): void {
  lang = next;
  progress.set({ lang });
  document.documentElement.lang = lang;
}
export function useEpisode(id: string): void {
  episodeId = id;
}

document.documentElement.lang = lang;
