/**
 * __TITLE__: episode script. Created by `npm run new:episode`.
 *
 * An episode is DATA: pages of steps (see src/engine/types.ts for every step you can use).
 *  - Text is always a key from i18n/en.json (then si.json and ta.json).
 *  - Every `say` needs `fact`: an id from facts.json, or null for pure feeling ("Goodbye!").
 *  - Start each page by saying where things are ({ place }, { sky }): the child may have
 *    skipped the page before.
 *  - Run docs/FUN_CHECKLIST.md before you open your pull request.
 */
import { defineEpisode } from '../../engine/types';

export default defineEpisode({
  id: '__ID__',
  order: 50,
  world: 'mars', // 'mars' | 'moon' | 'space'
  sky: 'marsDay',
  style: 'comic', // 'comic' | 'cinematic'
  machine: {}, // add { model: 'my-machine.glb' } once the optimised model is in assets/
  patch: { color: '#3D7BE8', glyph: '?' },
  pages: [
    // 1. Cinematic opening with a mystery question
    [
      { place: { x: 0, z: 0, heading: 0 } },
      { shot: { pos: [6, 2, 5], look: [0, 0.4, 0] } },
      { shot: { pos: [3.2, 0.9, 2.4], look: [0, 0.4, 0], ms: 9000 } },
      { caption: 'p1.where', fact: 'sample' },
      { say: 'p1.hello', fact: null },
      { act: 'p1.go' },
      { sfx: 'sfx.whirr', sound: 'beep' },
    ],
    // 2. A play moment from the mini-game kit (src/engine/play)
    [
      { place: { x: 0, z: 0, heading: 0 } },
      { shot: { pos: [1.5, 2.4, 5], look: [1.4, 0.2, 0.4] } },
      { say: 'p2.ask', fact: null },
      {
        play: 'holdToScan',
        config: {
          goal: 'p2.goal',
          hint: 'p2.hint',
          targets: [{ at: [2.6, 0, 0.6], label: 'p2.target', say: 'p2.result', fact: 'sample' }],
          holdSeconds: 2,
          msPerMetre: 700,
          winSay: 'p2.win',
          winFact: null,
        },
      },
    ],
    // 3. The goodbye, and the mission patch
    [
      { shot: { rel: 'machine', pos: [1.8, 0.7, 1.9], look: [0, 0.4, 0] } },
      { shot: { rel: 'machine', pos: [5, 3, 5.5], look: [0, 0.4, 0], ms: 12000 } },
      { say: 'p3.bye', fact: null },
      { patch: true },
    ],
  ],
});
