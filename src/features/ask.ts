/**
 * "Talk to the machine": the child asks a story's machine a question and it answers in first
 * person, only from that story's checked NASA facts, always with the source.
 * This free version needs no server: it finds the best-matching fact. Question buttons work in all
 * three languages; typed questions are matched in English (the facts are in English).
 */
import { button, el, link } from '../dom';
import { tEp } from '../engine/i18n';
import { factsOf } from '../episodes';
import { bestFact } from './ask-match';

/** Ready-made questions: their i18n key and the English words that find the answer. */
const STARTERS: { key: string; words: string }[] = [
  { key: 'ui.ask.q.when', words: 'landed launched landing launch date arrived' },
  { key: 'ui.ask.q.found', words: 'discovered found showed revealed images measured first science' },
  { key: 'ui.ask.q.power', words: 'power powered electricity rtg solar battery plutonium watts' },
  { key: 'ui.ask.q.end', words: 'last ended end shut silent contact final stopped' },
  { key: 'ui.ask.q.size', words: 'mass kg kilograms metres tall wide size long' },
];

/** Opens the panel over `host` for one story. */
export function openAsk(host: HTMLElement, episodeId: string): void {
  const facts = factsOf(episodeId);
  const t = (key: string, vars?: Record<string, string | number>): string => tEp(episodeId, key, vars);
  const name = t('speaker.machine') === 'speaker.machine' ? t('machine') : t('speaker.machine');
  const overlay = el('div', 'overlay ask', undefined, host);
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', t('ui.ask.title', { name }));
  const box = el('div', 'ask-box', undefined, overlay);
  el('h2', '', t('ui.ask.title', { name }), box);
  const log = el('div', 'ask-log', undefined, box);
  log.setAttribute('aria-live', 'polite');

  const say = (who: 'you' | 'it', text: string, source?: string): void => {
    const line = el('p', `ask-line ${who}`, undefined, log);
    el('b', '', who === 'you' ? t('ui.ask.you') : name, line);
    line.append(` ${text} `);
    if (source) link('ask-source', t('ui.holo.siteSource'), source, line);
    line.scrollIntoView({ block: 'nearest' });
  };
  const answer = (question: string, label: string): void => {
    say('you', label);
    const fact = bestFact(question, facts);
    if (fact) say('it', fact.text, fact.source);
    else say('it', t('ui.ask.unknown'));
  };
  say('it', t('ui.ask.hello', { name }));

  const chips = el('div', 'ask-chips', undefined, box);
  for (const s of STARTERS) button('chip', t(s.key), () => answer(s.words, t(s.key)), chips);

  const form = el('form', 'ask-form', undefined, box);
  const input = el('input', '', undefined, form);
  input.type = 'text';
  input.maxLength = 200;
  input.placeholder = t('ui.ask.placeholder');
  input.setAttribute('aria-label', t('ui.ask.placeholder'));
  button('btn', t('ui.ask.send'), () => undefined, form).type = 'submit';
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    answer(q, q);
  });
  el('p', 'ask-note', t('ui.ask.note'), box);
  button('btn alt', t('ui.close'), () => overlay.remove(), box);
  input.focus();
}
