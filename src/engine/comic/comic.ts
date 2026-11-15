/**
 * The storytelling layer drawn over the 3D scene: narrator captions, the machine's speech bubble,
 * sound-effect words, page cuts, and the Next / action / choice buttons.
 * Its look (comic book, cinematic, ...) comes entirely from CSS tokens, see styles/themes.css.
 */
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { CONFIG } from '../../config';
import { audio } from '../audio';
import { getLang, t } from '../i18n';
import { clamp } from '../noise';

gsap.registerPlugin(SplitText);

const REDUCED_MOTION = matchMedia('(prefers-reduced-motion: reduce)').matches;
const SFX_LIFETIME_MS = 1700;
/** Bubble margins (px): below the top controls, off the screen edges, above the Next button. */
const BUBBLE_MIN_TOP = 74;
const BUBBLE_EDGE = 16;
const BUBBLE_BOTTOM_ROOM = 96;

function div(className: string, parent: HTMLElement): HTMLDivElement {
  const el = document.createElement('div');
  el.className = className;
  parent.appendChild(el);
  return el;
}

function button(className: string, parent: HTMLElement): HTMLButtonElement {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = className;
  el.hidden = true;
  parent.appendChild(el);
  return el;
}

export class Comic {
  /** Mini-games put their HUD here. */
  readonly gameHost: HTMLDivElement;
  /** Labels and tap targets pinned to 3D objects go here. */
  readonly pinHost: HTMLDivElement;
  bubbleVisible = false;
  readonly #root: HTMLElement;
  readonly #flash: HTMLDivElement;
  readonly #cap: HTMLDivElement;
  readonly #bub: HTMLDivElement;
  readonly #who: HTMLSpanElement;
  readonly #bubText: HTMLSpanElement;
  readonly #sfxHost: HTMLDivElement;
  readonly #pageNo: HTMLDivElement;
  readonly #choices: HTMLDivElement;
  readonly #btnAct: HTMLButtonElement;
  readonly #btnNext: HTMLButtonElement;
  #typing = false;
  #hurry = false;
  #gate: (() => void) | null = null;
  /** Bumped by clear(): text that is still typing from an older page stops. */
  #run = 0;

  constructor(root: HTMLElement) {
    this.#root = root;
    div('dots', root);
    div('frame', root);
    this.#flash = div('flash', root);
    this.#pageNo = div('pageno', root);
    this.#cap = div('cap', root);
    this.#cap.hidden = true;
    this.#cap.setAttribute('aria-live', 'polite');
    this.#bub = div('bub', root);
    this.#bub.hidden = true;
    this.#bub.setAttribute('aria-live', 'polite');
    this.#who = document.createElement('span');
    this.#who.className = 'who';
    this.#bubText = document.createElement('span');
    this.#bub.append(this.#who, this.#bubText);
    this.pinHost = div('pins', root);
    this.#sfxHost = div('sfx-host', root);
    this.gameHost = div('game-host', root);
    this.#choices = div('choices', root);
    this.#choices.hidden = true;
    const acts = div('acts', root);
    this.#btnAct = button('btn alt', acts);
    this.#btnNext = button('btn', acts);
    this.#btnNext.addEventListener('click', () => this.pressNext());
  }

  /** The speaker name shown in the bubble. */
  setSpeaker(name: string): void {
    this.#who.textContent = name;
  }

  /** Page-turn cut: paper flash, words cleared, page number updated. */
  pageCut(page: number, total: number): void {
    this.clear();
    this.#pageNo.textContent = t('ui.page', { page, total });
    gsap.fromTo(this.#flash, { opacity: 0.95 }, { opacity: 0, duration: REDUCED_MOTION ? 0.1 : 0.42, ease: 'power2.out' });
  }

  #type(el: HTMLElement, text: string): Promise<void> {
    if (REDUCED_MOTION) {
      el.textContent = text;
      return Promise.resolve();
    }
    const run = this.#run;
    // Sinhala and Tamil letters combine, so those scripts are revealed word by word
    const units = getLang() === 'en' ? [...text] : text.split(/(?<=\s)/);
    let n = 0;
    this.#typing = true;
    this.#hurry = false;
    el.textContent = '';
    return new Promise((resolve) => {
      const step = (): void => {
        if (run !== this.#run) return;
        n = this.#hurry ? units.length : n + 1;
        el.textContent = units.slice(0, n).join('');
        if (n % 3 === 0) audio.play('tick');
        if (n >= units.length) {
          this.#typing = false;
          resolve();
          return;
        }
        setTimeout(step, CONFIG.typeMsPerChar * (units[n - 1].length > 1 ? 4 : 1));
      };
      step();
    });
  }

  /** Narrator box. Resolves when the text is fully shown. */
  caption(text: string): Promise<void> {
    if (this.#cap.hidden) {
      this.#cap.hidden = false;
      gsap.from(this.#cap, { x: -28, opacity: 0, duration: 0.28, ease: 'power2.out' });
    }
    return this.#type(this.#cap, text);
  }

  /** Speech bubble; the player keeps its tail on the machine via placeBubble(). */
  bubble(text: string): Promise<void> {
    if (this.#bub.hidden) {
      this.#bub.hidden = false;
      this.bubbleVisible = true;
      audio.play('pop');
      gsap.from(this.#bub, { scale: 0.6, opacity: 0, duration: 0.3, ease: 'back.out(2.4)' });
    }
    return this.#type(this.#bubText, text);
  }

  hideBubble(): void {
    this.#bub.hidden = true;
    this.bubbleVisible = false;
  }

  hideCaption(): void {
    this.#cap.hidden = true;
  }

  /**
   * Position the bubble above a screen point (or below it when there is no room). It always stays
   * fully on screen, clear of the top controls, the caption and the Next button.
   */
  /** Where the top controls end (px); the page sets it, since they wrap onto two rows on phones. */
  topInset = BUBBLE_MIN_TOP;

  placeBubble(anchorX: number, anchorY: number, underY: number): void {
    if (!this.bubbleVisible) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const bw = this.#bub.offsetWidth;
    const bh = this.#bub.offsetHeight;
    // the machine is off screen or behind the camera: speak from the lower middle instead
    if (!Number.isFinite(anchorX) || !Number.isFinite(anchorY) || anchorX < 0 || anchorX > w || anchorY < 0 || anchorY > h) {
      anchorX = w * 0.45;
      anchorY = h * 0.62;
      underY = h * 0.62;
    }
    let minTop = Math.max(BUBBLE_MIN_TOP, this.topInset);
    if (!this.#cap.hidden) {
      const cap = this.#cap.getBoundingClientRect();
      const left0 = clamp(anchorX - bw * 0.42, BUBBLE_EDGE, Math.max(BUBBLE_EDGE, w - bw - BUBBLE_EDGE));
      const overlapsCaption = left0 < cap.right && left0 + bw > cap.left;
      if (w <= CONFIG.wideLayoutPx || overlapsCaption) minTop = Math.max(minTop, cap.bottom + 12);
    }
    const maxTop = Math.max(minTop, h - bh - BUBBLE_BOTTOM_ROOM);
    const left = clamp(anchorX - bw * 0.42, BUBBLE_EDGE, Math.max(BUBBLE_EDGE, w - bw - BUBBLE_EDGE));
    let top = anchorY - bh - 34;
    let below = false;
    if (top < minTop) {
      top = Math.min(underY + 40, maxTop);
      below = top > anchorY;
      if (!below) top = minTop;
    }
    top = clamp(top, minTop, maxTop);
    this.#bub.style.left = `${left}px`;
    this.#bub.style.top = `${top}px`;
    this.#bub.classList.toggle('below', below);
    this.#bub.style.setProperty('--tail', `${clamp(anchorX - left, 34, Math.max(34, bw - 34))}px`);
  }

  /** Sound-effect word that pops in letter by letter, then removes itself. */
  sfx(word: string): void {
    const el = div('sfx', this.#sfxHost);
    el.textContent = word;
    // keep words apart when two fire close together
    el.style.top = `${18 + (this.#sfxHost.childElementCount - 1) * 14}vh`;
    if (!REDUCED_MOTION) {
      const split = SplitText.create(el, { type: getLang() === 'en' ? 'chars' : 'words' });
      const pieces = getLang() === 'en' ? split.chars : split.words;
      gsap.from(pieces, { scale: 0.1, rotation: -25, opacity: 0, duration: 0.4, stagger: 0.035, ease: 'back.out(3)' });
    }
    gsap.to(el, { opacity: 0, y: -20, duration: 0.3, delay: SFX_LIFETIME_MS / 1000, onComplete: () => el.remove() });
  }

  /** Show the Next button and wait for the child (or the keyboard) to press it. */
  next(label = t('ui.next')): Promise<void> {
    this.#btnNext.textContent = label;
    this.#btnNext.hidden = false;
    this.#btnNext.classList.add('wait');
    return new Promise((resolve) => {
      this.#gate = () => {
        this.#btnNext.classList.remove('wait');
        this.#btnNext.hidden = true;
        resolve();
      };
    });
  }

  /** Next was pressed: finish the typing first, otherwise open the gate. */
  pressNext(): void {
    if (this.#typing) {
      this.#hurry = true;
      return;
    }
    const gate = this.#gate;
    this.#gate = null;
    gate?.();
  }

  /** A big action button the child must press to make the story move. */
  act(label: string): Promise<void> {
    this.#btnAct.textContent = label;
    this.#btnAct.hidden = false;
    this.#btnAct.classList.add('wait');
    this.#btnNext.hidden = true;
    return new Promise((resolve) => {
      this.#btnAct.onclick = () => {
        this.#btnAct.hidden = true;
        this.#btnAct.onclick = null;
        audio.play('beep');
        resolve();
      };
    });
  }

  /** Show tappable choices; resolves with the index picked. */
  choice(labels: string[]): Promise<number> {
    this.#choices.replaceChildren();
    this.#choices.hidden = false;
    return new Promise((resolve) => {
      labels.forEach((label, i) => {
        const b = button('btn alt', this.#choices);
        b.hidden = false;
        b.textContent = label;
        b.onclick = () => {
          this.#choices.hidden = true;
          audio.play('beep');
          resolve(i);
        };
      });
      gsap.from(this.#choices.children, { y: 20, opacity: 0, stagger: 0.08, duration: 0.25 });
    });
  }

  /** Remove every word and button (used by page cuts, Skip and Home). */
  clear(): void {
    this.#run++;
    this.#typing = false;
    this.#gate = null;
    this.hideCaption();
    this.hideBubble();
    this.#btnNext.hidden = true;
    this.#btnAct.hidden = true;
    this.#btnAct.onclick = null;
    this.#choices.hidden = true;
    audio.hush();
  }

  /** True while Next would do something (used for the keyboard shortcut). */
  get waiting(): boolean {
    return this.#typing || this.#gate !== null;
  }

  dispose(): void {
    this.clear();
    gsap.killTweensOf([this.#flash, this.#cap, this.#bub]);
    this.#root.replaceChildren();
  }
}
