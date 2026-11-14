/**
 * All sound is synthesised with WebAudio, so the game ships no audio files of its own.
 * Voices: an episode's recorded clip plays when one exists; otherwise the browser reads the line
 * aloud (text-to-speech fallback).
 */
import { getLang } from './i18n';
import { progress } from './progress';

export type SoundName =
  | 'beep'
  | 'pop'
  | 'thud'
  | 'boing'
  | 'win'
  | 'fail'
  | 'tick'
  | 'ping'
  | 'radio'
  | 'whoosh'
  | 'powerDown';

// Recorded voice lines: src/episodes/<id>/voice/<lang>/<i18n key>.mp3 (or .ogg / .m4a / .webm)
const clips = import.meta.glob<string>('../episodes/*/voice/*/*.{mp3,ogg,m4a,webm}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const SPEECH_LANG: Record<string, string> = { en: 'en-US', si: 'si-LK', ta: 'ta-IN' };
const MASTER_VOLUME = 0.6;

class AudioEngine {
  #ctx: AudioContext | null = null;
  #master: GainNode | null = null;
  #motor: GainNode | null = null;
  #riser: { osc: OscillatorNode; gain: GainNode } | null = null;
  #clip: HTMLAudioElement | null = null;

  get soundOn(): boolean {
    return progress.get().sound;
  }
  get voiceOn(): boolean {
    return progress.get().voice;
  }

  /** Browsers only allow audio after a tap, so pages call this from their first button. */
  init(): void {
    if (this.#ctx) {
      void this.#ctx.resume();
      return;
    }
    try {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.value = this.soundOn ? MASTER_VOLUME : 0;
      master.connect(ctx.destination);
      this.#ctx = ctx;
      this.#master = master;
      this.#startAmbience(ctx, master);
    } catch {
      this.#ctx = null; // no audio device: the game stays fully playable in silence
    }
  }

  /** A soft wind-like pad plus a muted motor that drive() fades in while a machine moves. */
  #startAmbience(ctx: AudioContext, master: GainNode): void {
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 480;
    const pad = ctx.createGain();
    pad.gain.value = 0;
    filter.connect(pad);
    pad.connect(master);
    const voices: [number, OscillatorType, number][] = [
      [65.4, 'sine', 0.5],
      [98, 'sine', 0.3],
      [130.8, 'triangle', 0.14],
      [196, 'sine', 0.1],
    ];
    for (const [freq, type, vol] of voices) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = vol;
      osc.connect(gain);
      gain.connect(filter);
      osc.start();
    }
    pad.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 4);

    const motorOsc = ctx.createOscillator();
    const motorFilter = ctx.createBiquadFilter();
    const motor = ctx.createGain();
    motorOsc.type = 'sawtooth';
    motorOsc.frequency.value = 74;
    motorFilter.type = 'lowpass';
    motorFilter.frequency.value = 340;
    motor.gain.value = 0;
    motorOsc.connect(motorFilter);
    motorFilter.connect(motor);
    motor.connect(master);
    motorOsc.start();
    this.#motor = motor;
  }

  setSound(on: boolean): void {
    progress.set({ sound: on });
    if (this.#master) this.#master.gain.value = on ? MASTER_VOLUME : 0;
  }

  setVoice(on: boolean): void {
    progress.set({ voice: on });
    if (!on) this.hush();
  }

  tone(freq: number, dur: number, vol: number, type: OscillatorType = 'sine', slideTo?: number, delay = 0): void {
    const ctx = this.#ctx;
    if (!ctx || !this.#master) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(this.#master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  play(name: SoundName): void {
    switch (name) {
      case 'beep':
        this.tone(988, 0.12, 0.08, 'square');
        this.tone(1319, 0.16, 0.08, 'square', undefined, 0.13);
        break;
      case 'pop':
        this.tone(300, 0.18, 0.1, 'triangle', 620);
        break;
      case 'thud':
        this.tone(120, 0.3, 0.2, 'sine', 50);
        break;
      case 'boing':
        this.tone(180, 0.35, 0.16, 'sine', 520);
        break;
      case 'win':
        [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.22, 0.1, 'triangle', undefined, i * 0.1));
        break;
      case 'fail':
        this.tone(330, 0.2, 0.1, 'sawtooth', 160);
        this.tone(220, 0.3, 0.1, 'sawtooth', 90, 0.18);
        break;
      case 'tick':
        this.tone(760, 0.03, 0.02, 'square');
        break;
      case 'ping':
        this.tone(1568, 0.5, 0.08, 'sine');
        break;
      case 'radio':
        [1200, 900, 1500, 1100].forEach((f, i) => this.tone(f, 0.06, 0.04, 'square', undefined, i * 0.07));
        break;
      case 'whoosh':
        this.tone(900, 0.5, 0.06, 'sawtooth', 120);
        break;
      case 'powerDown':
        this.tone(392, 4, 0.09, 'sine', 98);
        break;
    }
  }

  /** Motor hum of a moving machine, 0 (off) to 1. */
  drive(level: number): void {
    if (this.#motor) this.#motor.gain.value += (level * 0.05 - this.#motor.gain.value) * 0.2;
  }

  /** A held, rising tone for progress bars: pass 0..1 while charging, or null to stop. */
  rise(progress01: number | null): void {
    const ctx = this.#ctx;
    if (!ctx || !this.#master) return;
    if (progress01 == null) {
      this.#riser?.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
      this.#riser?.osc.stop(ctx.currentTime + 0.2);
      this.#riser = null;
      return;
    }
    if (!this.#riser) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      gain.gain.value = 0.05;
      osc.connect(gain);
      gain.connect(this.#master);
      osc.start();
      this.#riser = { osc, gain };
    }
    this.#riser.osc.frequency.setTargetAtTime(220 + progress01 * 660, ctx.currentTime, 0.03);
  }

  /** Speak a line: the recorded clip when the episode has one, else text-to-speech. */
  say(text: string, opts: { episode: string; key: string; robot: boolean }): void {
    if (!this.voiceOn || !this.soundOn) return;
    this.hush();
    const lang = getLang();
    const base = `../episodes/${opts.episode}/voice/${lang}/${opts.key}.`;
    const url = Object.entries(clips).find(([path]) => path.startsWith(base))?.[1];
    if (url) {
      this.#clip = new Audio(url);
      void this.#clip.play().catch(() => undefined);
      return;
    }
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = SPEECH_LANG[lang] ?? 'en-US';
    u.rate = opts.robot ? 0.95 : 0.9;
    u.pitch = opts.robot ? 1.45 : 0.85;
    speechSynthesis.speak(u);
  }

  hush(): void {
    this.#clip?.pause();
    this.#clip = null;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }
}

export const audio = new AudioEngine();
export type { AudioEngine };
