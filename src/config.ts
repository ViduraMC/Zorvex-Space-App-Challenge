/** Product-wide values. One source of truth: nothing here is repeated inline elsewhere. */
export const CONFIG = {
  storageKey: 'zorvex.v1',
  langs: ['en', 'si', 'ta'] as const,
  defaultLang: 'en',
  /** "Look up tonight" falls back to our local event city when the child shares no location. */
  defaultPlace: { nameKey: 'place.kandy', lat: 7.2906, lon: 80.6337 },
  /** Typewriter speed of captions and bubbles. */
  typeMsPerChar: 20,
  maxPixelRatio: { high: 2, low: 1.25 },
  shadowMapSize: { high: 2048, low: 1024 },
  /** Below this width the comic text stacks above the subject instead of sitting beside it. */
  wideLayoutPx: 760,
  /** A tap counts as a hit on a 3D target when it lands this close on screen (touch-friendly). */
  tapRadiusPx: 46,
} as const;

export type Lang = (typeof CONFIG.langs)[number];
