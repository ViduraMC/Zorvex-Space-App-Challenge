/**
 * APOLLO 12 ALSEP: the science station the astronauts left behind, told by the station itself.
 * Story by Kaushal Bandara (Team Zorvex). Every fact is in facts.json (NSSDCA 1969-099C and the
 * NASA Surveyor 3 page, both challenge resources).
 * Play moments: launch the Saturn V, switch on the instruments, watch Intrepid lift off, catch the
 * first artificial moonquake, and count the hours of the long watch.
 */
import { defineEpisode } from '../../engine/types';
import { INTREPID_X, INTREPID_Z, SURVEYOR_X, SURVEYOR_Z } from './scene';
import buildScene from './scene';

const STATION = { x: 0, z: 0, heading: 0 } as const;
const LM_LOOK: [number, number, number] = [INTREPID_X, 3, INTREPID_Z];
const SURVEYOR_LOOK: [number, number, number] = [SURVEYOR_X, 1, SURVEYOR_Z];

export default defineEpisode({
  id: 'alsep-apollo-12',
  order: 4,
  world: 'moon',
  stages: ['earth'],
  sky: 'moonDay',
  style: 'cinematic',
  machine: { start: STATION },
  patch: { color: '#1A3A6B', glyph: 'A12' },
  lastContact: { date: '1977-09-30', fact: 'alsep-shutdown' },
  lookUp: 'Moon',
  stats: [
    { value: '2,872', label: 'stat.days' },
    { value: '6', label: 'stat.instruments' },
    { value: '25', label: 'stat.mass' },
    { value: '70', label: 'stat.power' },
  ],
  scene: buildScene,
  pages: [
    // 1. A memory: folded inside the lander, on top of a Saturn V
    [
      { stage: 'earth', sky: 'earthDay' },
      { call: 'launchPose' },
      { shot: { pos: [110, 16, 140], look: [0, 30, 0] } },
      { shot: { pos: [80, 12, 105], look: [0, 30, 0], ms: 9000 } },
      { caption: 'p1.where', fact: 'carried' },
      { say: 'p1.dark', fact: 'carried' },
      { say: 'p1.rocket', fact: 'carried' },
      { act: 'p1.go' },
      { call: 'launch' },
      { caption: 'p1.gone', fact: 'landing' },
    ],
    // 2. Waking up on the Moon
    [
      { stage: 'moon', sky: 'moonDay' },
      { call: 'landed' },
      { place: STATION },
      { power: 1 },
      { power: 0 },
      { shot: { rel: 'machine', pos: [4.5, 1.4, 5.5], look: [0, 1.2, 0] } },
      { shot: { rel: 'machine', pos: [3.4, 1.8, 4.2], look: [0, 1.4, 0], ms: 10000 } },
      { caption: 'p2.where', fact: 'landing', auto: 2600 },
      { sfx: 'sfx.warm', sound: 'beep' },
      { power: 1, ms: 2500 },
      { say: 'p2.warm', fact: 'snap-27' },
      { say: 'p2.power', fact: 'snap-27' },
      { say: 'p2.name', fact: 'carried' },
    ],
    // 3. Intrepid and her crew
    [
      { stage: 'moon', sky: 'moonDay' },
      { call: 'landed' },
      { place: STATION },
      { power: 1 },
      { shot: { pos: [-3, 2.2, 6], look: LM_LOOK } },
      { shot: { pos: [-1, 2.6, 4], look: LM_LOOK, ms: 10000 } },
      { say: 'p3.intrepid', fact: 'carried' },
      { caption: 'p3.crew', fact: 'crew' },
      { say: 'p3.tv', fact: 'tv-camera' },
    ],
    // 4. Switch on the six instruments
    [
      { stage: 'moon', sky: 'moonDay' },
      { call: 'landed' },
      { place: STATION },
      { power: 1 },
      { shot: { pos: [3, 11, 16], look: [0.5, 0, -1.5] } },
      { say: 'p4.cables', fact: 'six-instruments' },
      {
        play: 'holdToScan',
        config: {
          goal: 'p4.goal',
          hint: 'p4.hint',
          holdLabel: 'p4.hold',
          targets: [
            { at: 'seismometer', label: 'p4.t.seis', say: 'p4.s.seis', fact: 'seismometer', labelLift: 1.6 },
            { at: 'magnetometer', label: 'p4.t.mag', say: 'p4.s.mag', fact: 'magnetometer', labelLift: 1.6 },
            { at: 'solarWind', label: 'p4.t.wind', say: 'p4.s.wind', fact: 'solar-wind', labelLift: 1.6 },
            { at: 'ionGauge', label: 'p4.t.gauge', say: 'p4.s.gauge', fact: 'ion-gauge', labelLift: 1.6 },
            { at: 'dustDetector', label: 'p4.t.dust', say: 'p4.s.dust', fact: 'dust', labelLift: 1.6 },
            { at: 'ionDetector', label: 'p4.t.ions', say: 'p4.s.ions', fact: 'ion-detector', labelLift: 1.6 },
          ],
          need: 4,
          holdSeconds: 1.6,
          winSay: 'p4.win',
          winFact: 'central-station',
        },
      },
      { caption: 'p4.on', fact: 'alsep-on' },
    ],
    // 5. The old neighbour: Surveyor 3
    [
      { stage: 'moon', sky: 'moonDay' },
      { call: 'landed' },
      { place: STATION },
      { power: 1 },
      { shot: { pos: [12, 3, 4], look: SURVEYOR_LOOK } },
      { shot: { pos: [16, 2.2, 8.5], look: SURVEYOR_LOOK, ms: 11000 } },
      { say: 'p5.cousin', fact: 'surveyor-3' },
      { caption: 'p5.close', fact: 'landing' },
      { say: 'p5.parts', fact: 'surveyor-visit' },
      { caption: 'p5.why', fact: 'surveyor-visit' },
    ],
    // 6. Intrepid leaves
    [
      { stage: 'moon', sky: 'moonDay' },
      { call: 'landed' },
      { place: STATION },
      { power: 1 },
      { shot: { pos: [-6, 2, 10], look: LM_LOOK } },
      { caption: 'p6.time', fact: 'liftoff' },
      { act: 'p6.go' },
      { shot: { pos: [-8, 2, 12], look: LM_LOOK, follow: 'intrepidAscent' } },
      { call: 'liftoff' },
      { shot: { pos: [-6, 2.2, 10], look: LM_LOOK, ms: 3000, follow: false } },
      { say: 'p6.stay', fact: 'liftoff' },
      { say: 'p6.alone', fact: null },
    ],
    // 7. The first artificial moonquake
    [
      { stage: 'moon', sky: 'moonDay' },
      { call: 'landed' },
      { call: 'liftoffDone' },
      { place: STATION },
      { power: 1 },
      { shot: { rel: 'machine', pos: [-4, 1.8, 5], look: [0, 1, 0] } },
      { say: 'p7.plan', fact: 'moonquake' },
      {
        play: 'custom:quake',
        config: {
          goal: 'p7.goal',
          hint: 'p7.hint',
          tapLabel: 'p7.tap',
          calmLabel: 'p7.calm',
          gotLabel: 'p7.got',
          rounds: 3,
          winSay: 'p7.win',
          winFact: 'moonquake',
        },
      },
      { say: 'p7.science', fact: 'seismometer' },
    ],
    // 8. The long watch
    [
      { stage: 'moon', sky: 'moonDay' },
      { call: 'landed' },
      { call: 'liftoffDone' },
      { place: STATION },
      { power: 1 },
      { shot: { pos: [8, 4, 9], look: [2, 1, -2] } },
      { say: 'p8.home', fact: 'carried' },
      { call: 'longWatch', block: false },
      {
        play: 'counterRace',
        config: {
          goal: 'p8.goal',
          hint: 'p8.hint',
          plan: 31,
          actual: 68928,
          unit: 'p8.unit',
          planLabel: 'p8.plan',
          tapLabel: 'p8.tap',
          planSfx: 'sfx.more',
          winSay: 'p8.win',
          winFact: 'watch-length',
        },
      },
      { caption: 'p8.decay', fact: 'rtg-decay' },
    ],
    // 9. Switched off, still there
    [
      { stage: 'moon' },
      { sky: { day: 0.15, sunset: 0, az: 2.4 }, ms: 4000 },
      { call: 'landed' },
      { call: 'liftoffDone' },
      { place: STATION },
      { power: 1 },
      { shot: { rel: 'machine', pos: [3.5, 1.5, 4], look: [0, 1.4, 0] } },
      { shot: { rel: 'machine', pos: [16, 8, 20], look: [4, 1, -2], ms: 24000 } },
      { caption: 'p9.date', fact: 'alsep-shutdown' },
      { power: 0, ms: 5000 },
      { sfx: 'sfx.off', sound: 'powerDown' },
      { say: 'p9.still', fact: 'liftoff' },
      { say: 'p9.bye', fact: null },
      { caption: 'p9.last', auto: 3600 },
      { patch: true },
    ],
  ],
});
