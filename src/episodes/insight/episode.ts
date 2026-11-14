/**
 * INSIGHT: the lander that listened to the inside of Mars (Elysium Planitia, 2018 to 2022).
 * Story by Bimsara Yehan and Yasassri Ekanayake (Team Zorvex). Every fact is in facts.json (the
 * NASA InSight page, a challenge resource, and its science instruments page).
 * Play moments: place the seismometer, catch marsquakes, start the mole.
 */
import { defineEpisode } from '../../engine/types';
import buildScene from './scene';

const LANDER = { x: 0, z: 0, heading: 0 } as const;

export default defineEpisode({
  id: 'insight',
  order: 3,
  world: 'mars',
  sky: 'marsAfternoon',
  style: 'cinematic',
  machine: { start: LANDER },
  patch: { color: '#D97736', glyph: 'I' },
  lastContact: { date: '2022-12-15', fact: 'end' },
  anatomy: 'insight-lander',
  lookUp: 'Mars',
  stats: [
    { value: '3', label: 'stat.instruments' },
    { value: '5', label: 'stat.mole' },
    { value: '38', label: 'stat.seis' },
    { value: '4', label: 'stat.years' },
  ],
  scene: buildScene,
  pages: [
    // 1. From California to Elysium Planitia
    [
      { sky: 'marsDay' },
      { call: 'arrive' },
      { place: LANDER },
      { power: 1 },
      { shot: { rel: 'machine', pos: [7, 3, 8], look: [0, 0.8, 0] } },
      { shot: { rel: 'machine', pos: [4.5, 1.8, 5.5], look: [0, 0.7, 0], ms: 12000 } },
      { caption: 'p1.launch', fact: 'launch' },
      { caption: 'p1.marco', fact: 'marco' },
      { caption: 'p1.date', fact: 'landing' },
      { sfx: 'sfx.touchdown', sound: 'thud' },
      { say: 'p1.hello', fact: 'purpose' },
      { say: 'p1.flat', fact: 'landing' },
      { say: 'p1.vital', fact: 'purpose' },
    ],
    // 2. Place the seismometer
    [
      { sky: 'marsDay' },
      { call: 'arrive' },
      { place: LANDER },
      { power: 1 },
      { shot: { pos: [4.6, 2.2, 5.2], look: [2.4, 0.3, 1.8] } },
      { say: 'p2.arm', fact: 'seis' },
      { act: 'p2.deploy' },
      { sfx: 'sfx.whirr', sound: 'beep' },
      { call: 'deployInstruments' },
      { sfx: 'sfx.clunk', sound: 'thud' },
      { say: 'p2.seis', fact: 'seis' },
      { say: 'p2.first', fact: 'first-interior' },
    ],
    // 3. Listen: marsquakes
    [
      { sky: 'marsAfternoon' },
      { call: 'ready' },
      { place: LANDER },
      { power: 1 },
      { shot: { pos: [4.4, 1.3, 4.4], look: [2.4, 0.3, 1.8] } },
      { caption: 'p3.intro', fact: 'seis-specs' },
      {
        play: 'seismograph',
        config: {
          goal: 'p3.goal',
          hint: 'p3.hint',
          tapLabel: 'p3.tap',
          burstSfx: 'sfx.thump',
          calmLabel: 'p3.calm',
          gotLabel: 'p3.got',
          rounds: 3,
          winSay: 'p3.win',
          winFact: 'seis',
        },
      },
      { say: 'p3.wind', fact: 'wind' },
    ],
    // 4. The mole, and the wobble
    [
      { sky: 'marsAfternoon' },
      { call: 'ready' },
      { place: LANDER },
      { power: 1 },
      { shot: { pos: [3.6, 1.4, -3.2], look: [1.5, 0.2, -1.4] } },
      { say: 'p4.mole', fact: 'hp3' },
      { act: 'p4.go' },
      { call: 'hammer' },
      { say: 'p4.stuck', fact: 'hp3' },
      { shot: { rel: 'machine', pos: [6, 3, 6], look: [0, 0.8, 0], ms: 5000 } },
      { say: 'p4.rise', fact: 'rise' },
      { say: 'p4.core', fact: 'rise' },
    ],
    // 5. Goodbye
    [
      { sky: 'marsDusk', ms: 4000 },
      { call: 'ready' },
      { place: LANDER },
      { power: 1 },
      { shot: { rel: 'machine', pos: [3, 1.2, 3.5], look: [0, 0.7, 0] } },
      { shot: { rel: 'machine', pos: [10, 5, 11], look: [0, 0.5, 0], ms: 22000 } },
      { caption: 'p5.end', fact: 'end' },
      { sound: 'powerDown' },
      { power: 0.05, ms: 6000 },
      { say: 'p5.bye', fact: null },
      { caption: 'p5.still', auto: 3600 },
      { patch: true },
    ],
  ],
});
