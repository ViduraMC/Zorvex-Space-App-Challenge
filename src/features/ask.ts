/**
 * "Talk to the machine": the child asks a story's machine a question and it answers in first
 * person, only from that story's checked NASA facts, always with the source.
 * With VITE_ASK_URL set, our server (server/ask) asks a small AI model to answer in the child's
 * language from those facts only. Without it, or when the server fails, the free offline matcher
 * picks the best fact (question buttons work in all three languages, typed questions in English).
 */
import { button, el, link } from '../dom';
import { getLang, tEp } from '../engine/i18n';
import { factsOf } from '../episodes';
import { bestFact } from './ask-match';

const ASK_URL: string = import.meta.env.VITE_ASK_URL ?? '';
const ASK_TIMEOUT_MS = 15000;

interface AiAnswer {
  answer: string;
  sources: { id: string; url: string }[];
}

async function askServer(episode: string, question: string): Promise<AiAnswer | null> {
  if (!ASK_URL) return null;
  try {
    const res = await fetch(ASK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ episode, question, lang: getLang() }),
      signal: AbortSignal.timeout(ASK_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as AiAnswer;
    return typeof data.answer === 'string' && data.answer ? data : null;
  } catch {
    return null; // offline, blocked or slow: the free matcher answers instead
  }
}

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
  const answer = async (question: string, label: string): Promise<void> => {
    say('you', label);
    const thinking = ASK_URL ? el('p', 'ask-line it ask-thinking', t('ui.ask.thinking'), log) : null;
    const ai = await askServer(episodeId, label);
    thinking?.remove();
    if (ai) {
      say('it', ai.answer, ai.sources[0]?.url);
      return;
    }
    const fact = bestFact(question, facts);
    if (fact) say('it', fact.text, fact.source);
    else say('it', t('ui.ask.unknown'));
  };
  say('it', t('ui.ask.hello', { name }));

  const chips = el('div', 'ask-chips', undefined, box);
  for (const s of STARTERS) button('chip', t(s.key), () => void answer(s.words, t(s.key)), chips);

  const form = el('form', 'ask-form', undefined, box);
  const input = el('input', '', undefined, form);
  input.type = 'text';
  input.maxLength = 200;
  input.placeholder = t(ASK_URL ? 'ui.ask.placeholderAi' : 'ui.ask.placeholder');
  input.setAttribute('aria-label', input.placeholder);
  button('btn', t('ui.ask.send'), () => undefined, form).type = 'submit';
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    void answer(q, q);
  });
  el('p', 'ask-note', t('ui.ask.note'), box);
  button('btn alt', t('ui.close'), () => overlay.remove(), box);
  input.focus();
}
