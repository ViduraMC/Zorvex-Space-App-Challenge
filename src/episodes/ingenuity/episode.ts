/**
 * INGENUITY: the first aircraft to fly on another planet (Jezero Crater, Mars, 2021 to 2024).
 * Every fact is in facts.json (the NASA Ingenuity page, a challenge resource).
 * Play moments: survive the first night, fly the first flight, spot the rover from the air,
 * and push 5 planned flights to the 72 it really flew.
 */
import { defineEpisode } from '../../engine/types';
import buildScene, { HELIPAD, ROVER_AWAY } from './scene';

const ROVER_LOOK: [number, number, number] = [ROVER_AWAY.x, 1, ROVER_AWAY.z];

export default defineEpisode({
  id: 'ingenuity',
  order: 6,
  world: 'mars',
  sky: 'marsDay',
  style: 'cinematic',
  machine: { start: HELIPAD },
  patch: { color: '#7A8B99', glyph: 'G' },
  anatomy: 'ingenuity',
  lastContact: { date: '2024-01-18', fact: 'last' },
  lookUp: 'Mars',
  stats: [
    { value: '72', label: 'stat.flights' },
    { value: '1.8', label: 'stat.mass' },
    { value: '17.0', label: 'stat.km' },
    { value: '24', label: 'stat.height' },
  ],
  scene: buildScene,
  pages: [
    // 1. The ride to Mars, under the rover's belly
    [
      { call: 'underRover' },
      { place: HELIPAD },
      { power: 1 },
      { shot: { pos: [6, 2.2, 7], look: [0, 0.8, 0] } },
      { shot: { pos: [4.2, 1.2, 5], look: [0, 0.6, 0], ms: 12000 } },
      { caption: 'p1.where', fact: 'ride' },
      { say: 'p1.hello', fact: 'ride' },
      { say: 'p1.small', fact: 'size' },
      { act: 'p1.drop' },
      { call: 'dropOff' },
      { sfx: 'sfx.free', sound: 'chime' },
      { say: 'p1.feet', fact: 'ride' },
    ],
    // 2. PLAY: survive the first freezing night on battery power
    [
      { sky: 'marsDusk', ms: 3000 },
      { call: 'ready' },
      { place: HELIPAD },
      { power: 1 },
      { shot: { rel: 'machine', pos: [2.2, 0.8, 2.4], look: [0, 0.3, 0] } },
      { say: 'p2.night', fact: 'first-night' },
      { say: 'p2.panel', fact: 'power' },
      {
        play: 'resourceManage',
        config: {
          goal: 'p2.goal',
          hint: 'p2.hint',
          seconds: 18,
          start: 0.7,
          drainPerSecond: 0.07,
          meterLabel: 'p2.meter',
          actions: [
            { label: 'p2.heat', gain: 0.16, cooldown: 3 },
            { label: 'p2.sleep', gain: 0.1, cooldown: 2 },
          ],
          events: [
            { at: 7, label: 'p2.cold', delta: -0.15, sound: 'hiss' },
            { at: 15, label: 'p2.sunrise', delta: 0.3, sound: 'chime' },
          ],
          clockLabel: 'p2.clock',
          clockSpan: 12,
          winSay: 'p2.win',
          winFact: 'first-night',
        },
      },
    ],
    // 3. PLAY: the first flight
    [
      { sky: 'marsDay', ms: 2000 },
      { call: 'ready' },
      { place: HELIPAD },
      { shot: { rel: 'machine', pos: [3.5, 1.4, 4], look: [0, 0.8, 0] } },
      { caption: 'p3.date', fact: 'first-flight' },
      { say: 'p3.thin', fact: 'thin-air' },
      { call: 'spin' },
      {
        play: 'balance',
        config: {
          goal: 'p3.goal',
          hint: 'p3.hint',
          input: 'hold',
          holdSeconds: 6,
          band: [0.45, 0.75],
          push: 0.7,
          fall: 0.45,
          wobble: 0.3,
          controlLabel: 'p3.power',
          lift: 3,
          sound: 'rotor',
          winSay: 'p3.win',
          winFact: 'first-flight',
        },
      },
      { call: 'rest' },
      { caption: 'p3.wright', fact: 'first-flight' },
    ],
    // 4. PLAY: spot the rover from the air
    [
      { call: 'ready' },
      { place: HELIPAD },
      { caption: 'p4.date', fact: 'rover-photo' },
      {
        play: 'findHidden',
        config: {
          goal: 'p4.goal',
          hint: 'p4.hint',
          items: ['perseverance'],
          decoys: ['rock0', 'rock1', 'rock2'],
          missSay: 'p4.miss',
          camera: { pos: [-1, 14, 6], look: [-6, 0, -3] },
          winSay: 'p4.win',
          winFact: 'rover-photo',
        },
      },
    ],
    // 5. PLAY: five flights planned, 72 flown
    [
      { call: 'ready' },
      { place: HELIPAD },
      { shot: { pos: [5, 2, -6], look: ROVER_LOOK } },
      { say: 'p5.plan', fact: 'demo' },
      { say: 'p5.scout', fact: 'scout' },
      {
        play: 'counterRace',
        config: {
          goal: 'p5.goal',
          hint: 'p5.hint',
          plan: 5,
          actual: 72,
          unit: 'p5.unit',
          planLabel: 'p5.planChip',
          tapLabel: 'p5.tap',
          taps: 14,
          planSfx: 'sfx.more',
          winSay: 'p5.win',
          winFact: 'flights',
        },
      },
      { caption: 'p5.totals', fact: 'totals' },
    ],
    // 6. The last flight, and goodbye
    [
      { sky: 'marsDusk', ms: 4000 },
      { call: 'ready' },
      { place: HELIPAD },
      { shot: { rel: 'machine', pos: [2, 0.6, 2.4], look: [0, 0.4, 0] } },
      { shot: { rel: 'machine', pos: [10, 5, 11], look: [0, 0.4, 0], ms: 22000 } },
      { caption: 'p6.last', fact: 'last' },
      { say: 'p6.proud', fact: 'flights' },
      { power: 0.05, ms: 5000 },
      { say: 'p6.bye', fact: null },
      { caption: 'p6.still', auto: 3600 },
      { patch: true },
    ],
  ],
});
