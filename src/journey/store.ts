/**
 * The journey state machine (docs/BUILD_GUIDE.md, section 5.2):
 *   HOME -start-> HOME_WALK -> TAKEOFF -> DESTINATION -choose-> LANDING -> EXPLORERS
 *   EXPLORERS -explore(id)-> HOLOGRAM_LAUNCH -> BLACKOUT -> STORY
 * Only these actions change the phase. Each one checks the current phase first, so a double
 * click or a late animation callback can never skip or repeat a cutscene.
 * No DOM here: node can test it directly.
 */
export type Phase =
  | 'HOME'
  | 'HOME_WALK'
  | 'TAKEOFF'
  | 'DESTINATION'
  | 'LANDING'
  | 'EXPLORERS'
  | 'HOLOGRAM_LAUNCH'
  | 'BLACKOUT'
  | 'STORY';
export type Destination = 'moon' | 'mars';

export interface JourneyState {
  phase: Phase;
  destination: Destination | null;
  hoveredId: string | null;
  selectedId: string | null;
}

/** Where a cutscene phase leads when it finishes. */
const NEXT: Partial<Record<Phase, Phase>> = {
  HOME_WALK: 'TAKEOFF',
  TAKEOFF: 'DESTINATION',
  LANDING: 'EXPLORERS',
  HOLOGRAM_LAUNCH: 'BLACKOUT',
  BLACKOUT: 'STORY',
};

export function createJourney() {
  let state: JourneyState = { phase: 'HOME', destination: null, hoveredId: null, selectedId: null };
  const listeners = new Set<(state: JourneyState, previous: JourneyState) => void>();
  const set = (patch: Partial<JourneyState>): void => {
    const previous = state;
    state = { ...state, ...patch };
    for (const fn of [...listeners]) fn(state, previous);
  };

  return {
    get: (): Readonly<JourneyState> => state,
    /** Returns the unsubscribe function. */
    subscribe(fn: (state: JourneyState, previous: JourneyState) => void): () => void {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    start(): void {
      if (state.phase === 'HOME') set({ phase: 'HOME_WALK' });
    },
    /** A cutscene reports that it ended (or was skipped). Ignored unless it is the current phase. */
    finish(from: Phase): void {
      const next = NEXT[from];
      if (state.phase === from && next) set({ phase: next });
    },
    choose(destination: Destination): void {
      if (state.phase === 'DESTINATION') set({ destination, phase: 'LANDING' });
    },
    hover(id: string | null): void {
      if (state.phase === 'EXPLORERS' && id !== state.hoveredId) set({ hoveredId: id });
    },
    explore(id: string): void {
      if (state.phase === 'EXPLORERS') set({ selectedId: id, hoveredId: id, phase: 'HOLOGRAM_LAUNCH' });
    },
    /** Coming back from a story: straight to the explorers, no cutscenes replayed. */
    resume(): void {
      if (state.destination) set({ phase: 'EXPLORERS', selectedId: null });
      else set({ phase: 'HOME' });
    },
    /** "Change destination" on the explorers screen. */
    travel(): void {
      if (state.phase === 'EXPLORERS') set({ phase: 'DESTINATION', hoveredId: null });
    },
  };
}

export type Journey = ReturnType<typeof createJourney>;
/** One journey per visit: it survives route changes, so Back returns to the explorers. */
export const journey = createJourney();
