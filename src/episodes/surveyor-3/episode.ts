/**
 * SURVEYOR 3: the robot that tested the Moon's soil for the astronauts (1967), and was visited by
 * them two and a half years later. Every fact is in facts.json (the NASA Surveyor 3 page, a
 * challenge resource). Play moments: the bouncy landing, take the first pictures, dig trenches
 * to test the soil, and count the pictures.
 */
import { defineEpisode } from '../../engine/types';
import buildScene, { LANDER, TRENCHES } from './scene';

export default defineEpisode({
  id: 'surveyor-3',
  order: 8,
  world: 'moon',
  sky: 'moonDay',
  style: 'cinematic',
  machine: { start: LANDER },
  patch: { color: '#8C9BAA', glyph: 'S3' },
  lastContact: { date: '1967-05-04', fact: 'end' },
  lookUp: 'Moon',
  stats: [
    { value: '6,326', label: 'stat.pictures' },
    { value: '4', label: 'stat.trenches' },
    { value: '2', label: 'stat.bounces' },
    { value: '180', label: 'stat.apollo' },
  ],
  scene: buildScene,
  pages: [
    // 1. The bouncy landing
    [
      { call: 'arrive' },
      { place: LANDER },
      { power: 1 },
      { shot: { pos: [9, 11, 13], look: [0, 13, 0] } },
      { caption: 'p1.launch', fact: 'launch' },
      { say: 'p1.hello', fact: 'sampler' },
      { act: 'p1.land' },
      { shot: { pos: [9, 3, 11], look: [0, 2, 0], ms: 4000 }, block: false },
      { call: 'bounce' },
      { sfx: 'sfx.boing' },
      { say: 'p1.oops', fact: 'bounces' },
      { caption: 'p1.where', fact: 'landing' },
    ],
    // 2. PLAY: the first pictures
    [
      { call: 'landed' },
      { place: LANDER },
      { power: 1 },
      { shot: { pos: [4, 2.2, 4.5], look: [0, 1, 0] } },
      { say: 'p2.camera', fact: 'camera' },
      {
        play: 'holdToScan',
        config: {
          goal: 'p2.goal',
          hint: 'p2.hint',
          holdLabel: 'p2.hold',
          targets: [
            { at: [6, 0, -3], label: 'p2.t.horizon', say: 'p2.s.horizon', fact: 'pictures', labelLift: 1 },
            { at: [3, 0, 3], label: 'p2.t.rocks', say: 'p2.s.rocks', fact: 'pictures', labelLift: 0.6 },
            { at: [1.3, 0, -0.1], label: 'p2.t.foot', say: 'p2.s.foot', fact: 'camera', labelLift: 0.4 },
          ],
          holdSeconds: 2,
          winSay: 'p2.win',
          winFact: 'pictures',
        },
      },
    ],
    // 3. PLAY: dig and press: is the ground strong enough for astronauts?
    [
      { call: 'landed' },
      { place: LANDER },
      { power: 1 },
      { shot: { pos: [3.6, 2.6, 3.4], look: [0.8, 0.5, -0.3] } },
      { say: 'p3.question', fact: 'soil' },
      { act: 'p3.dig' },
      { call: 'dig' },
      {
        play: 'holdToScan',
        config: {
          goal: 'p3.goal',
          hint: 'p3.hint',
          holdLabel: 'p3.hold',
          targets: [
            { at: TRENCHES[0], label: 'p3.t.trench', say: 'p3.s.trench', fact: 'tests', labelLift: 0.3 },
            { at: TRENCHES[1], label: 'p3.t.press', say: 'p3.s.press', fact: 'tests', labelLift: 0.3 },
          ],
          holdSeconds: 2.2,
          winSay: 'p3.win',
          winFact: 'soil',
        },
      },
      { call: 'dig' },
      { caption: 'p3.why', fact: 'soil' },
    ],
    // 4. The lunar night
    [
      { call: 'landed' },
      { call: 'showTrenches' },
      { place: LANDER },
      { power: 1 },
      { sky: { day: 0.12, sunset: 0, az: 2.6 }, ms: 6000, block: false },
      { shot: { pos: [5, 2, 5], look: [0, 1, 0] } },
      { shot: { pos: [8, 3, 9], look: [0, 1, 0], ms: 14000 } },
      { say: 'p4.night', fact: 'end' },
      { power: 0.05, ms: 5000 },
      { caption: 'p4.last', fact: 'end' },
    ],
    // 5. Visitors from Earth
    [
      { sky: 'moonDay', ms: 3000 },
      { call: 'visit' },
      { place: LANDER },
      { power: 0.05 },
      { shot: { pos: [-4, 2.2, 6], look: [6, 2, -4] } },
      { shot: { pos: [-3, 2, 5], look: [6, 2, -4], ms: 12000 } },
      { caption: 'p5.visit', fact: 'visit' },
      { caption: 'p5.parts', fact: 'parts' },
      { say: 'p5.proud', fact: 'soil' },
    ],
    // 6. Goodbye
    [
      { call: 'visit' },
      { place: LANDER },
      { power: 0.05 },
      { shot: { pos: [3, 1.4, 3.6], look: [0, 1, 0] } },
      { shot: { pos: [12, 6, 13], look: [0, 1, 0], ms: 22000 } },
      { say: 'p6.bye', fact: null },
      { caption: 'p6.still', auto: 3600 },
      { patch: true },
    ],
  ],
});
