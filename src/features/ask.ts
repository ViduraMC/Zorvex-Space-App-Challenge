/**
 * "Talk to the machine": a side panel where the child chats with a story's machine. It answers in
 * first person, in the child's language, only from that story's checked NASA facts, always with
 * the source. With VITE_ASK_URL set, our server (server/ask) asks a small Gemini model, sending the
 * last few turns so the machine remembers the conversation. Without it, or when the server fails,
 * the free offline matcher picks the best fact (question buttons work in all three languages).
 */
import gsap from 'gsap';
import { button, el, link } from '../dom';
import { getLang, tEp } from '../engine/i18n';
import { factsOf, findEpisode } from '../episodes';
import { bestFact } from './ask-match';

const ASK_URL: string = import.meta.env.VITE_ASK_URL ?? '';
const ASK_TIMEOUT_MS = 15000;
/** Turns sent back to the server for context (the server accepts at most 6). */
const HISTORY_TURNS = 6;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

interface AiAnswer {
  answer: string;
  sources: { id: string; url: string }[];
}
interface Turn {
  role: 'you' | 'it';
  text: string;
  source?: string;
}

/** Each machine's conversation, kept while the page is open, so closing the panel loses nothing. */
const conversations = new Map<string, Turn[]>();

async function askServer(episode: string, question: string, history: Turn[]): Promise<AiAnswer | null> {
  if (!ASK_URL) return null;
  try {
    const res = await fetch(ASK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        episode,
        question,
        lang: getLang(),
        history: history.slice(-HISTORY_TURNS).map(({ role, text }) => ({ role, text: text.slice(0, 600) })),
      }),
      signal: AbortSignal.timeout(ASK_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as AiAnswer;
    return typeof data.answer === 'string' && data.answer ? data : null;
  } catch {
    return null; // offline, blocked or slow: the free matcher answers instead
  }
}

/** Ready-made questions: their i18n key and the English words that find the answer offline. */
const STARTERS: { key: string; words: string }[] = [
  { key: 'ui.ask.q.when', words: 'landed launched landing launch date arrived' },
  { key: 'ui.ask.q.found', words: 'discovered found showed revealed images measured first science' },
  { key: 'ui.ask.q.power', words: 'power powered electricity rtg solar battery plutonium watts' },
  { key: 'ui.ask.q.end', words: 'last ended end shut silent contact final stopped' },
  { key: 'ui.ask.q.size', words: 'mass kg kilograms metres tall wide size long' },
];

/** The machine's round badge: its patch colour and letters, with signal rings while it talks. */
function avatar(episodeId: string, parent: HTMLElement, className: string): HTMLElement {
  const patch = findEpisode(episodeId)?.patch ?? { color: '#4fd8ff', glyph: '?' };
  const node = el('span', `ask-avatar ${className}`, undefined, parent);
  node.style.setProperty('--patch', patch.color);
  el('b', '', patch.glyph, node);
  node.setAttribute('aria-hidden', 'true');
  return node;
}

let openPanel: { close: () => void } | null = null;

/**
 * Opens the chat panel over `host` for one story.
 * `as` names the machine when one story covers several (Opportunity shares Spirit's story).
 */
export function openAsk(host: HTMLElement, episodeId: string, as?: string): void {
  openPanel?.close();
  const facts = factsOf(episodeId);
  const t = (key: string, vars?: Record<string, string | number>): string => tEp(episodeId, key, vars);
  const name = as ?? (t('speaker.machine') === 'speaker.machine' ? t('machine') : t('speaker.machine'));
  const key = `${episodeId}:${name}`;
  const history = conversations.get(key) ?? [];
  conversations.set(key, history);

  const panel = el('aside', 'ask-panel', undefined, host);
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', t('ui.ask.title', { name }));
  const head = el('header', 'ask-head', undefined, panel);
  const badge = avatar(episodeId, head, 'big');
  const who = el('div', 'ask-who', undefined, head);
  el('h2', '', name, who);
  const status = el('span', 'ask-status', t(ASK_URL ? 'ui.ask.live' : 'ui.ask.offline'), who);
  const opener = document.activeElement as HTMLElement | null;
  const closeBtn = button('ask-close', '×', () => close(), head);
  closeBtn.setAttribute('aria-label', t('ui.close'));

  const log = el('div', 'ask-log', undefined, panel);
  log.setAttribute('aria-live', 'polite');
  const chips = el('div', 'ask-chips', undefined, panel);
  const form = el('form', 'ask-form', undefined, panel);
  const input = el('input', '', undefined, form);
  input.type = 'text';
  input.maxLength = 200;
  input.placeholder = t(ASK_URL ? 'ui.ask.placeholderAi' : 'ui.ask.placeholder');
  input.setAttribute('aria-label', input.placeholder);
  input.enterKeyHint = 'send';
  const send = button('ask-send', '➤', () => undefined, form);
  send.type = 'submit';
  send.setAttribute('aria-label', t('ui.ask.send'));
  el('p', 'ask-note', t('ui.ask.note'), panel);

  const scrollDown = (): void => log.scrollTo({ top: log.scrollHeight, behavior: REDUCED ? 'auto' : 'smooth' });
  const addSource = (bubble: HTMLElement, source?: string): void => {
    if (source) link('ask-source', `↗ ${t('ui.holo.siteSource')}`, source, bubble);
  };
  const draw = (turn: Turn, animate: boolean): void => {
    const row = el('div', `ask-row ${turn.role}`, undefined, log);
    if (turn.role === 'it') avatar(episodeId, row, 'small');
    const bubble = el('p', 'ask-line', undefined, row);
    if (animate && !REDUCED && turn.role === 'it') {
      // the answer arrives word by word, like a signal coming in
      const words = turn.text.split(/(\s+)/);
      let shown = 0;
      const tick = (): void => {
        shown += 2;
        bubble.textContent = words.slice(0, shown).join('');
        scrollDown();
        if (shown < words.length) setTimeout(tick, 45);
        else addSource(bubble, turn.source);
      };
      tick();
    } else {
      bubble.textContent = turn.text;
      addSource(bubble, turn.source);
    }
    if (animate && !REDUCED) gsap.from(row, { y: 14, opacity: 0, duration: 0.3, ease: 'power2.out' });
    scrollDown();
  };
  const say = (turn: Turn): void => {
    history.push(turn);
    draw(turn, true);
  };

  let busy = false;
  const answer = async (offlineWords: string, label: string): Promise<void> => {
    if (busy) return;
    busy = true;
    const earlier = history.slice();
    say({ role: 'you', text: label });
    const typing = el('div', 'ask-row it ask-typing', undefined, log);
    avatar(episodeId, typing, 'small');
    const dots = el('p', 'ask-line', undefined, typing);
    for (let i = 0; i < 3; i++) el('i', '', undefined, dots);
    badge.classList.add('talking');
    status.textContent = t('ui.ask.thinking');
    scrollDown();
    const ai = await askServer(episodeId, label, earlier);
    typing.remove();
    badge.classList.remove('talking');
    status.textContent = t(ASK_URL ? 'ui.ask.live' : 'ui.ask.offline');
    if (ai) {
      say({ role: 'it', text: ai.answer, source: ai.sources[0]?.url });
    } else {
      const fact = bestFact(offlineWords, facts);
      say(fact ? { role: 'it', text: fact.text, source: fact.source } : { role: 'it', text: t('ui.ask.unknown') });
    }
    busy = false;
  };

  if (history.length === 0) say({ role: 'it', text: t('ui.ask.hello', { name }) });
  else for (const turn of history) draw(turn, false);

  // each ready question disappears once asked, so the row only offers new ones
  for (const s of STARTERS) {
    const chip = button('chip', t(s.key), () => {
      if (busy) return;
      chip.remove();
      void answer(s.words, t(s.key));
    }, chips);
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    void answer(q, q);
  });

  // Escape or the close button closes it, and focus returns where it was
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', onKey);
  function close(): void {
    document.removeEventListener('keydown', onKey);
    openPanel = null;
    host.classList.remove('asking');
    const done = (): void => panel.remove();
    if (REDUCED) done();
    else gsap.to(panel, { x: 40, opacity: 0, duration: 0.2, onComplete: done });
    opener?.focus();
  }
  openPanel = { close };
  host.classList.add('asking');
  if (!REDUCED) gsap.from(panel, { x: 60, opacity: 0, duration: 0.35, ease: 'power3.out' });
  input.focus({ preventScroll: true });
}

/** Closes the chat panel if one is open (a page calls this when it leaves). */
export const closeAsk = (): void => openPanel?.close();

/** A floating "Talk to …" button that stays on screen during a story. */
export function askLauncher(host: HTMLElement, episodeId: string): HTMLButtonElement {
  const t = (key: string, vars?: Record<string, string | number>): string => tEp(episodeId, key, vars);
  const name = t('speaker.machine') === 'speaker.machine' ? t('machine') : t('speaker.machine');
  const b = button('ask-fab', '', () => openAsk(host, episodeId), host);
  avatar(episodeId, b, 'small');
  el('span', 'ask-fab-label', t('ui.ask.open', { name }), b);
  b.setAttribute('aria-label', t('ui.ask.open', { name }));
  return b;
}
