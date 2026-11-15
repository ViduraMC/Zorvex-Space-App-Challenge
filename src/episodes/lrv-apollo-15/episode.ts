/**
 * THE APOLLO 15 LUNAR ROVER: the first car on the Moon (Hadley, July and August 1971).
 * Every fact is in facts.json (the NSSDCA Apollo 15 page, a challenge resource).
 * Play moments: unfold the rover, drive to Hadley Rille, collect samples along the Apennines,
 * drop the hammer and the feather.
 */
import { defineEpisode } from '../../engine/types';
import buildScene, { CHECKPOINTS, FALCON, ROVER } from './scene';

const FALCON_LOOK: [number, number, number] = [FALCON.x, 3, FALCON.z];

export default defineEpisode({
  id: 'lrv-apollo-15',
  order: 7,
  world: 'moon',
  sky: 'moonDay',
  style: 'cinematic',
  machine: { start: ROVER },
  patch: { color: '#C9A43A', glyph: 'LRV' },
  lastContact: { date: '1971-08-02', fact: 'liftoff' },
  lookUp: 'Moon',
  stats: [
    { value: '27.9', label: 'stat.km' },
    { value: '77.31', label: 'stat.kg' },
    { value: '3', label: 'stat.evas' },
    { value: '5', label: 'stat.range' },
  ],
  scene: buildScene,
  pages: [
    // 1. Hadley, and a car folded up on the side of Falcon
    [
      { call: 'folded' },
      { place: ROVER },
      { power: 1 },
      { shot: { pos: [-6, 2.5, 8], look: FALCON_LOOK } },
      { shot: { pos: [-4, 2, 6], look: FALCON_LOOK, ms: 12000 } },
      { caption: 'p1.where', fact: 'landing' },
      { caption: 'p1.crew', fact: 'crew' },
      { say: 'p1.hello', fact: 'carried' },
      { act: 'p1.unfold' },
      { call: 'unfold' },
      { say: 'p1.first', fact: 'first' },
    ],
    // 2. PLAY: drive to the edge of Hadley Rille
    [
      { call: 'parked' },
      { place: ROVER },
      { power: 1 },
      { shot: { rel: 'machine', pos: [-4, 2, 4], look: [-10, 0, 0] } },
      { say: 'p2.go', fact: 'eva1' },
      {
        play: 'directDrive',
        config: {
          goal: 'p2.goal',
          hint: 'p2.hint',
          checkpoints: CHECKPOINTS,
          radius: 1.5,
          speed: 3.4,
          gravity: 1.62,
          bounce: 0.9,
          bounds: 60,
          landFx: 'moonDust',
          winSay: 'p2.win',
          winFact: 'eva1',
        },
      },
      { caption: 'p2.core', fact: 'eva1' },
    ],
    // 3. PLAY: samples along the mountains
    [
      { call: 'parked' },
      { place: ROVER },
      { power: 1 },
      { shot: { pos: [2, 4, 12], look: [9, 0, 4] } },
      { say: 'p3.mountains', fact: 'eva2' },
      {
        play: 'holdToScan',
        config: {
          goal: 'p3.goal',
          hint: 'p3.hint',
          holdLabel: 'p3.hold',
          targets: [
            { at: 'index', label: 'p3.t.index', say: 'p3.s.bag', fact: 'eva2', standoff: 1.6, labelLift: 0.5 },
            { at: 'dune', label: 'p3.t.dune', say: 'p3.s.bag2', fact: 'eva2', standoff: 1.6, labelLift: 0.5 },
            { at: 'spur', label: 'p3.t.spur', say: 'p3.s.bag3', fact: 'eva2', standoff: 1.6, labelLift: 0.5 },
          ],
          holdSeconds: 2,
          msPerMetre: 500,
          winSay: 'p3.win',
          winFact: 'totals',
        },
      },
      { caption: 'p3.west', fact: 'eva3' },
    ],
    // 4. The hammer and the feather
    [
      { call: 'parked' },
      { place: ROVER },
      { power: 1 },
      { shot: { pos: [-2.4, 1.2, 5.6], look: [-2.4, 0.8, 2.2] } },
      { say: 'p4.question', fact: 'feather' },
      { act: 'p4.drop' },
      { call: 'drop' },
      { sfx: 'sfx.same' },
      { say: 'p4.why', fact: 'feather' },
    ],
    // 5. Remembering, and the liftoff
    [
      { call: 'parked' },
      { place: ROVER },
      { power: 1 },
      { shot: { pos: [-5, 2, 9], look: FALCON_LOOK } },
      { caption: 'p5.memorial', fact: 'memorial' },
      { caption: 'p5.time', fact: 'liftoff' },
      { shot: { pos: [-6, 2, 10], look: [FALCON.x, 25, FALCON.z], ms: 6000 }, block: false },
      { call: 'liftoff' },
      { say: 'p5.stay', fact: 'first' },
    ],
    // 6. Parked for good
    [
      { sky: { day: 0.2, sunset: 0, az: 2.2 }, ms: 4000 },
      { call: 'parked' },
      { call: 'liftoff', block: false },
      { place: ROVER },
      { power: 1 },
      { shot: { rel: 'machine', pos: [2.8, 1.4, 3.2], look: [0, 0.8, 0] } },
      { shot: { rel: 'machine', pos: [12, 6, 13], look: [0, 0.8, 0], ms: 24000 } },
      { caption: 'p6.totals', fact: 'totals' },
      { power: 0.05, ms: 5000 },
      { say: 'p6.bye', fact: null },
      { caption: 'p6.still', auto: 3600 },
      { patch: true },
    ],
  ],
});
