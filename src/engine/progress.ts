import { CONFIG, type Lang } from '../config';

export type Quality = 'high' | 'low';

interface Save {
  done: string[];
  lang: Lang;
  quality: Quality;
  sound: boolean;
  voice: boolean;
}

const DEFAULTS: Save = {
  done: [],
  lang: CONFIG.defaultLang,
  // phones start on the light setting; the HUD toggle switches either way
  quality: typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches ? 'low' : 'high',
  sound: true,
  voice: true,
};

function load(): Save {
  try {
    // localStorage throws in private windows and when site data is blocked; play on without saving
    const raw = localStorage.getItem(CONFIG.storageKey);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Save>) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

let save = load();

export const progress = {
  get: (): Readonly<Save> => save,
  set(patch: Partial<Save>): void {
    save = { ...save, ...patch };
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(save));
    } catch {
      /* storage unavailable: progress lasts for this visit only */
    }
  },
  isDone: (id: string): boolean => save.done.includes(id),
  finish(id: string): void {
    if (!save.done.includes(id)) progress.set({ done: [...save.done, id] });
  },
};
