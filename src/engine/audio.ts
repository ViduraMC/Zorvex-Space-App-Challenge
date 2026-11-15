/**
 * All sound is synthesised with WebAudio, so the game ships no audio files of its own.
 * Voices: an episode's recorded clip plays when one exists; otherwise the browser reads the line
 * aloud (text-to-speech fallback).
 */
import { CONFIG } from '../config';
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
  | 'powerDown'
  /** Rocket engines lighting: a crack and a deep thump. */
  | 'ignition'
  /** An explosion or crash: a noise burst with a falling boom. */
  | 'boom'
  /** Small thrusters or a valve: a short hiss. */
  | 'hiss'
  /** A parachute snapping open. */
  | 'chute'
  /** A motor or arm joint moving. */
  | 'servo'
  /** A bright chime for a discovery. */
  | 'chime'
  /** Radio static. */
  | 'static';

/** Background air for each world: Mars and Earth have wind; the Moon and space are near-silent. */
export type Ambience = 'mars' | 'earth' | 'moon' | 'space';

// Recorded voice lines: src/episodes/<id>/voice/<lang>/<i18n key>.mp3 (or .ogg / .m4a / .webm)
const clips = import.meta.glob<string>('../episodes/*/voice/*/*.{mp3,ogg,m4a,webm}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const SPEECH_LANG: Record<string, string> = { en: 'en-US', si: 'si-LK', ta: 'ta-IN' };

/** Who speaks with which voice, per episode (used when a line has no recorded clip). */
const casts = import.meta.glob<Record<string, { gender?: 'male' | 'female' }>>('../episodes/*/voice/cast.json', {
  eager: true,
  import: 'default',
});

// Common system voice names; the browser does not say which voices are male or female.
const FEMALE = /aria|jenny|zira|sonia|libby|natasha|clara|emma|samantha|karen|moira|serena|female|google uk english female|heera|veena/i;
const MALE = /guy|david|mark|ryan|christopher|eric|daniel|george|thomas|alex|fred|male|google uk english male|ravi/i;

function pickVoice(lang: string, gender: 'male' | 'female'): SpeechSynthesisVoice | undefined {
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
  const wanted = voices.filter((v) => (gender === 'female' ? FEMALE : MALE).test(v.name) && !(gender === 'female' ? MALE : FEMALE).test(v.name.replace(/female/i, '')));
  // natural (online neural) voices sound far better where the browser has them
  return wanted.find((v) => /natural|online|neural/i.test(v.name)) ?? wanted[0] ?? voices[0];
}
function makeNoise(ctx: AudioContext): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

const MASTER_VOLUME = 0.7;
const AMBIENCE: Record<Ambience, { wind: number; cutoff: number; pad: number }> = {
  mars: { wind: 0.16, cutoff: 520, pad: 0.12 },
  earth: { wind: 0.1, cutoff: 900, pad: 0.1 },
  moon: { wind: 0, cutoff: 300, pad: 0.16 },
  space: { wind: 0, cutoff: 300, pad: 0.2 },
};
/** How far the background (wind, engines) dips while a voice line plays. */
const DUCK = 0.45;
/** The opening theme: bar length (s), loudness and its four chords (A minor, F, C, G; in Hz). */
const MUSIC_BAR_S = 4.8;
const MUSIC_VOLUME = 0.55;
const MUSIC_CHORDS: number[][] = [
  [110, 164.81, 220, 261.63, 329.63],
  [87.31, 130.81, 220, 261.63, 349.23],
  [130.81, 196, 261.63, 329.63, 392],
  [98, 146.83, 246.94, 293.66, 392],
];

/** A looping layer whose loudness follows a 0..1 level (rocket roar, helicopter rotors, motor). */
interface Loop {
  gain: GainNode;
  max: number;
}

class AudioEngine {
  #ctx: AudioContext | null = null;
  #master: GainNode | null = null;
  /** Short effects. */
  #sfx: GainNode | null = null;
  /** Wind, pad and engine loops: ducked under voices. */
  #bed: GainNode | null = null;
  #noise: AudioBuffer | null = null;
  #wind: { gain: GainNode; filter: BiquadFilterNode } | null = null;
  #pad: GainNode | null = null;
  #motor: Loop | null = null;
  #rocket: Loop | null = null;
  #rotor: Loop | null = null;
  #riser: { osc: OscillatorNode; gain: GainNode } | null = null;
  #clip: HTMLAudioElement | null = null;
  #music: { gain: GainNode; timer: number; step: number } | null = null;
  /** The music level asked for before the first tap made audio possible. */
  #musicWanted = 0;

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
      // a compressor keeps a rocket roar and a chime at a comfortable, even loudness
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.ratio.value = 4;
      const master = ctx.createGain();
      master.gain.value = this.soundOn ? MASTER_VOLUME : 0;
      comp.connect(master);
      master.connect(ctx.destination);
      const sfx = ctx.createGain();
      const bed = ctx.createGain();
      sfx.connect(comp);
      bed.connect(comp);
      this.#ctx = ctx;
      this.#master = master;
      this.#sfx = sfx;
      this.#bed = bed;
      this.#noise = makeNoise(ctx);
      this.#startBed(ctx, bed);
      if (this.#musicWanted > 0) this.music(this.#musicWanted);
    } catch {
      this.#ctx = null; // no audio device: the game stays fully playable in silence
    }
  }

  #noiseSource(ctx: AudioContext): AudioBufferSourceNode {
    const src = ctx.createBufferSource();
    src.buffer = this.#noise;
    src.loop = true;
    return src;
  }

  /** The always-on bed: a soft pad, world wind, and silent loops that levels fade in. */
  #startBed(ctx: AudioContext, bed: GainNode): void {
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 480;
    const pad = ctx.createGain();
    pad.gain.value = 0;
    padFilter.connect(pad);
    pad.connect(bed);
    const padVoices: [number, OscillatorType, number][] = [
      [65.4, 'sine', 0.5],
      [98, 'sine', 0.3],
      [130.8, 'triangle', 0.14],
      [196, 'sine', 0.1],
    ];
    for (const [freq, type, vol] of padVoices) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = vol;
      osc.connect(gain);
      gain.connect(padFilter);
      osc.start();
    }
    this.#pad = pad;

    // wind: noise through a slowly wandering low-pass filter
    const windSrc = this.#noiseSource(ctx);
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 500;
    const gust = ctx.createOscillator();
    const gustDepth = ctx.createGain();
    gust.frequency.value = 0.13;
    gustDepth.gain.value = 220;
    gust.connect(gustDepth);
    gustDepth.connect(windFilter.frequency);
    const wind = ctx.createGain();
    wind.gain.value = 0;
    windSrc.connect(windFilter);
    windFilter.connect(wind);
    wind.connect(bed);
    windSrc.start();
    gust.start();
    this.#wind = { gain: wind, filter: windFilter };

    // motor hum of a driving rover
    const motorOsc = ctx.createOscillator();
    const motorFilter = ctx.createBiquadFilter();
    motorOsc.type = 'sawtooth';
    motorOsc.frequency.value = 74;
    motorFilter.type = 'lowpass';
    motorFilter.frequency.value = 340;
    const motor = ctx.createGain();
    motor.gain.value = 0;
    motorOsc.connect(motorFilter);
    motorFilter.connect(motor);
    motor.connect(bed);
    motorOsc.start();
    this.#motor = { gain: motor, max: 0.05 };

    // rocket roar: a low body, a mid roar and a hiss, all filtered noise, plus a sub-bass rumble
    const rocket = ctx.createGain();
    rocket.gain.value = 0;
    rocket.connect(bed);
    const layers: [BiquadFilterType, number, number][] = [
      ['lowpass', 140, 1.0],
      ['bandpass', 420, 0.55],
      ['highpass', 2400, 0.1],
    ];
    for (const [type, freq, vol] of layers) {
      const src = this.#noiseSource(ctx);
      const f = ctx.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = vol;
      src.connect(f);
      f.connect(g);
      g.connect(rocket);
      src.start(ctx.currentTime + Math.random() * 0.5);
    }
    // the roar flutters quickly, like crackling exhaust
    const crackle = ctx.createGain();
    crackle.gain.value = 1;
    const flutter = ctx.createOscillator();
    const flutterDepth = ctx.createGain();
    flutter.type = 'square';
    flutter.frequency.value = 23;
    flutterDepth.gain.value = 0.18;
    flutter.connect(flutterDepth);
    flutterDepth.connect(crackle.gain);
    flutter.start();
    const sub = ctx.createOscillator();
    sub.frequency.value = 38;
    const subGain = ctx.createGain();
    subGain.gain.value = 0.45;
    sub.connect(subGain);
    subGain.connect(crackle);
    crackle.connect(rocket);
    sub.start();
    this.#rocket = { gain: rocket, max: 0.55 };

    // helicopter rotors: a buzzing blade tone chopped at the blade-pass rate
    const blade = ctx.createOscillator();
    blade.type = 'sawtooth';
    blade.frequency.value = 84;
    const chop = ctx.createGain();
    chop.gain.value = 0.5;
    const chopper = ctx.createOscillator();
    const chopDepth = ctx.createGain();
    chopper.type = 'square';
    chopper.frequency.value = 42;
    chopDepth.gain.value = 0.5;
    chopper.connect(chopDepth);
    chopDepth.connect(chop.gain);
    const rotorFilter = ctx.createBiquadFilter();
    rotorFilter.type = 'lowpass';
    rotorFilter.frequency.value = 900;
    const rotor = ctx.createGain();
    rotor.gain.value = 0;
    blade.connect(chop);
    chop.connect(rotorFilter);
    rotorFilter.connect(rotor);
    rotor.connect(bed);
    blade.start();
    chopper.start();
    this.#rotor = { gain: rotor, max: 0.12 };
    this.ambience('earth');
  }

  /** Fade the background to a world: wind on Mars and Earth, a quiet hum on the Moon and in space. */
  ambience(kind: Ambience): void {
    const ctx = this.#ctx;
    if (!ctx || !this.#wind || !this.#pad) return;
    const a = AMBIENCE[kind];
    this.#wind.gain.gain.setTargetAtTime(a.wind, ctx.currentTime, 1.2);
    this.#wind.filter.frequency.setTargetAtTime(a.cutoff, ctx.currentTime, 1.2);
    this.#pad.gain.setTargetAtTime(a.pad, ctx.currentTime, 1.5);
  }

  #level(loop: Loop | null, level: number, smooth: number): void {
    const ctx = this.#ctx;
    if (!ctx || !loop) return;
    loop.gain.gain.setTargetAtTime(Math.max(0, Math.min(1, level)) * loop.max, ctx.currentTime, smooth);
  }

  /**
   * Our own slow theme for the opening screens (0 = off, 1 = full): a church-organ swell over four
   * chords and a soft clock tick, in the spirit of big space films. Synthesised here, no recording.
   */
  music(level: number): void {
    this.#musicWanted = level;
    const ctx = this.#ctx;
    if (!ctx || !this.#bed) return;
    if (!this.#music) {
      if (level <= 0) return;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(this.#bed);
      const state = { gain, timer: 0, step: 0 };
      const play = (): void => this.#musicBar(ctx, gain, state.step++);
      play();
      state.timer = window.setInterval(play, MUSIC_BAR_S * 1000);
      this.#music = state;
    }
    const music = this.#music;
    music.gain.gain.setTargetAtTime(level * MUSIC_VOLUME, ctx.currentTime, 1.2);
    if (level <= 0) {
      // let it fade, then stop scheduling bars
      window.setTimeout(() => {
        if (this.#musicWanted > 0 || this.#music !== music) return;
        window.clearInterval(music.timer);
        music.gain.disconnect();
        this.#music = null;
      }, 5000);
    }
  }

  /** One bar of the theme: an organ chord that swells and fades, and four clock ticks. */
  #musicBar(ctx: AudioContext, out: GainNode, step: number): void {
    const t = ctx.currentTime + 0.05;
    const chord = MUSIC_CHORDS[step % MUSIC_CHORDS.length];
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1500;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.linearRampToValueAtTime(0.16, t + MUSIC_BAR_S * 0.35);
    env.gain.setTargetAtTime(0.0001, t + MUSIC_BAR_S * 0.75, MUSIC_BAR_S * 0.25);
    filter.connect(env);
    env.connect(out);
    // organ pipes: each note with its octave and a faint fifth above, for that cathedral sound
    for (const f of chord) {
      for (const [mult, vol, type] of [
        [1, 0.5, 'sine'],
        [2, 0.22, 'triangle'],
        [3, 0.08, 'sine'],
      ] as const) {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = f * mult;
        const g = ctx.createGain();
        g.gain.value = vol / chord.length;
        osc.connect(g);
        g.connect(filter);
        osc.start(t);
        osc.stop(t + MUSIC_BAR_S * 1.6);
      }
    }
    // the ticking clock: time passing
    for (let k = 0; k < 4; k++) {
      const at = t + (k * MUSIC_BAR_S) / 4;
      const osc = ctx.createOscillator();
      osc.frequency.value = k % 2 ? 1760 : 1320;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.linearRampToValueAtTime(0.035, at + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.06);
      osc.connect(g);
      g.connect(out);
      osc.start(at);
      osc.stop(at + 0.08);
    }
  }

  /** Rocket engines, 0 (off) to 1 (full roar). It glides, so calling it every frame is fine. */
  rocket(level: number): void {
    this.#level(this.#rocket, level, 0.25);
  }

  /** Helicopter rotors, 0 to 1. */
  rotor(level: number): void {
    this.#level(this.#rotor, level, 0.3);
  }

  /** A burst of filtered noise: the building block of hisses, booms and chutes. */
  #burst(type: BiquadFilterType, from: number, to: number, dur: number, vol: number, delay = 0): void {
    const ctx = this.#ctx;
    if (!ctx || !this.#sfx) return;
    const t = ctx.currentTime + delay;
    const src = this.#noiseSource(ctx);
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + Math.min(0.02, dur / 4));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(this.#sfx);
    src.start(t);
    src.stop(t + dur + 0.05);
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
    if (!ctx || !this.#sfx) return;
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
    gain.connect(this.#sfx);
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
        this.#burst('bandpass', 2400, 300, 0.7, 0.22);
        this.tone(700, 0.5, 0.025, 'sawtooth', 120);
        break;
      case 'ignition':
        this.#burst('lowpass', 3000, 200, 0.5, 0.5);
        this.tone(70, 0.9, 0.35, 'sine', 32);
        this.#burst('highpass', 4000, 1500, 0.18, 0.15, 0.05);
        break;
      case 'boom':
        this.#burst('lowpass', 1600, 60, 1.6, 0.6);
        this.tone(90, 1.4, 0.4, 'sine', 28);
        break;
      case 'hiss':
        this.#burst('highpass', 3500, 2200, 0.35, 0.16);
        break;
      case 'chute':
        this.#burst('bandpass', 600, 1800, 0.25, 0.3);
        this.#burst('lowpass', 900, 200, 0.6, 0.25, 0.18);
        break;
      case 'servo':
        this.tone(420, 0.35, 0.035, 'sawtooth', 640);
        this.tone(640, 0.25, 0.03, 'sawtooth', 380, 0.36);
        break;
      case 'chime':
        [1047, 1319, 1568, 2093].forEach((f, i) => this.tone(f, 0.9, 0.05, 'sine', undefined, i * 0.07));
        break;
      case 'static':
        this.#burst('bandpass', 2600, 1800, 0.45, 0.12);
        this.#burst('bandpass', 1400, 2200, 0.3, 0.08, 0.2);
        break;
      case 'powerDown':
        this.tone(392, 4, 0.09, 'sine', 98);
        break;
    }
  }

  /** Motor hum of a moving machine, 0 (off) to 1. */
  drive(level: number): void {
    this.#level(this.#motor, level, 0.1);
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
      gain.connect(this.#sfx ?? this.#master);
      osc.start();
      this.#riser = { osc, gain };
    }
    this.#riser.osc.frequency.setTargetAtTime(220 + progress01 * 660, ctx.currentTime, 0.03);
  }

  /**
   * Speak a line: the recorded clip when the episode has one (npm run voices), else the
   * browser's text-to-speech, picking a voice that matches the role's gender in voice/cast.json.
   */
  say(text: string, opts: { episode: string; key: string; role: string }): void {
    if (!this.voiceOn || !this.soundOn) return;
    this.hush();
    const lang = getLang();
    const clipFor = (l: string): string | undefined =>
      Object.entries(clips).find(([path]) => path.startsWith(`../episodes/${opts.episode}/voice/${l}/${opts.key}.`))?.[1];
    // Sinhala and Tamil have text but no recorded voices yet: they hear the English recording
    const url = clipFor(lang) ?? clipFor(CONFIG.defaultLang);
    if (url) {
      this.clip(url);
      return;
    }
    // browser speech would read Sinhala or Tamil text with an English voice, so only English uses it
    if (lang !== CONFIG.defaultLang || !('speechSynthesis' in window)) return;
    const cast = casts[`../episodes/${opts.episode}/voice/cast.json`];
    const gender = cast?.[opts.role]?.gender ?? (opts.role === 'narrator' ? 'male' : 'female');
    const u = new SpeechSynthesisUtterance(text);
    u.lang = SPEECH_LANG[lang] ?? 'en-US';
    const voice = pickVoice(u.lang, gender);
    if (voice) u.voice = voice;
    u.rate = opts.role === 'narrator' ? 0.92 : 0.98;
    u.pitch = opts.role === 'narrator' ? 0.9 : 1.1;
    speechSynthesis.speak(u);
  }

  /** Play a recorded clip (stops the previous one). */
  clip(url: string): void {
    if (!this.voiceOn || !this.soundOn) return;
    this.hush();
    this.#clip = new Audio(url);
    // the wind and engines step back while someone speaks
    const ctx = this.#ctx;
    const bed = this.#bed;
    if (ctx && bed) {
      bed.gain.setTargetAtTime(DUCK, ctx.currentTime, 0.15);
      const lift = (): void => void bed.gain.setTargetAtTime(1, ctx.currentTime, 0.6);
      this.#clip.addEventListener('ended', lift);
      this.#clip.addEventListener('pause', lift);
    }
    void this.#clip.play().catch(() => undefined);
  }

  hush(): void {
    this.#clip?.pause();
    this.#clip = null;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }
}

export const audio = new AudioEngine();
export type { AudioEngine };
