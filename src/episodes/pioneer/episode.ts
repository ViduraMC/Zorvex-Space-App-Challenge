/**
 * PIONEER 10 & 11: the first spacecraft to the outer planets.
 * Deep-space episode. No ground, no landing, no orbit — these are flyby probes.
 * The story covers both spacecraft in first person, alternating narrators.
 * Every `fact` id points into facts.json; every text key into i18n/<lang>.json.
 */
import { defineEpisode } from '../../engine/types';
import buildScene from './scene';

export default defineEpisode({
  id: 'pioneer',
  order: 10,
  world: 'space',
  sky: 'space',
  style: 'cinematic',
  machine: { start: { x: 0, z: 0 } },
  patch: { color: '#3D7BE8', glyph: '🛰' },
  lastContact: { date: '2003-01-23', fact: 'p10-last-signal' },
  stats: [
    { value: '21', label: 'stat.planned' },
    { value: '31', label: 'stat.worked' },
    { value: '258', label: 'stat.mass' },
    { value: '12', label: 'stat.instruments' },
  ],
  scene: buildScene,
  pages: [
    // ---- Page 1: "Born on Earth" — Introduction ----
    [
      { call: 'reset' },
      { place: { x: 0, z: 0, heading: 0 } },
      { shot: { pos: [4, 2, 3], look: [0, 0, 0] } },
      { shot: { pos: [2.5, 0.8, 2], look: [0, 0.2, 0], ms: 14000 } },
      { caption: 'p1.date', fact: 'trw-build' },
      { say: 'p1.hello', fact: null },
      { say: 'p1.purpose', fact: 'first-jupiter' },
      { say: 'p1.weight', fact: 'weight' },
      { say: 'p1.p10instruments', fact: 'p10-instruments' },
      { say: 'p1.p11instruments', fact: 'p11-instruments' },
      { say: 'p1.rtgs', fact: 'rtg-power' },
    ],
    // ---- Page 2: "The Launch" — Departure ----
    [
      { call: 'readyState' },
      { place: { x: 0, z: 0, heading: 0 } },
      { call: 'reset' },
      { shot: { pos: [5, 1.5, 4], look: [0, 0, 0] } },
      { caption: 'p2.date10', fact: 'p10-launch' },
      { say: 'p2.liftoff', fact: null },
      { act: 'p2.deploy' },
      { sfx: 'sfx.deploy', sound: 'beep' },
      { call: 'deployBooms' },
      { say: 'p2.deployed', fact: 'spin' },
      { shot: { pos: [6, 2, 5], look: [0, 0, 0], ms: 6000 } },
      { say: 'p2.sister', fact: 'p11-launch' },
    ],
    // ---- Page 3: "The Asteroid Belt" — First crossing ----
    [
      { call: 'showBelt' },
      { place: { x: 0, z: 0, heading: 0 } },
      { shot: { pos: [4, 3, 6], look: [0, 0, 0] } },
      { shot: { pos: [3, 1.5, 4], look: [0, 0, 0], ms: 12000 } },
      { caption: 'p3.date', fact: 'first-belt' },
      { say: 'p3.belt', fact: null },
      {
        play: 'counterRace',
        config: {
          goal: 'p3.goal',
          hint: 'p3.hint',
          plan: 50,
          actual: 6,
          unit: 'p3.unit',
          planLabel: 'p3.planLabel',
          tapLabel: 'p3.tap',
          winSay: 'p3.safe',
          winFact: 'belt-safe',
        },
      },
    ],
    // ---- Page 4: "Jupiter" — The flyby ----
    [
      { call: 'showJupiter' },
      { place: { x: 0, z: 0, heading: 0 } },
      { shot: { pos: [3, 1.5, 4], look: [0, 0, 0] } },
      { shot: { pos: [0, 0.5, 3], look: [15, -1, -8], ms: 10000 } },
      { caption: 'p4.date', fact: 'p10-jupiter' },
      { say: 'p4.approach', fact: 'first-jupiter' },
      {
        play: 'balance',
        config: {
          goal: 'p4.goal',
          hint: 'p4.hint',
          input: 'hold' as const,
          holdSeconds: 8,
          band: [0.35, 0.75] as [number, number],
          push: 0.8,
          fall: 0.5,
          wobble: 0.35,
          controlLabel: 'p4.control',
          readout: 'p4.readout',
          unitMax: 100,
          winSay: 'p4.data',
          winFact: 'jupiter-radiation',
        },
      },
      { say: 'p4.heat', fact: 'jupiter-heat' },
      { caption: 'p4.p11date', fact: 'p11-jupiter' },
      { say: 'p4.slingshot', fact: 'gravity-assist' },
    ],
    // ---- Page 5: "Saturn" — Pioneer 11's discovery ----
    [
      { call: 'showSaturn' },
      { place: { x: 0, z: 0, heading: 0 } },
      { shot: { pos: [6, 3, 8], look: [20, 0, 6] } },
      { shot: { pos: [3, 1, 5], look: [20, 0, 6], ms: 12000 } },
      { caption: 'p5.date', fact: 'p11-saturn' },
      { say: 'p5.rings', fact: 'saturn-images' },
      {
        play: 'findHidden',
        config: {
          goal: 'p5.goal',
          hint: 'p5.hint',
          items: ['fRing'],
          decoys: [],
          need: 1,
          missSay: 'p5.miss',
          camera: { pos: [25, 5, 15], look: [40, 0, 12] },
          winSay: 'p5.discovery',
          winFact: 'f-ring',
        },
      },
      { say: 'p5.titan', fact: 'titan-temp' },
      { say: 'p5.magfield', fact: 'saturn-magfield' },
    ],
    // ---- Page 6: "Beyond Neptune" — The outer journey ----
    [
      { call: 'showSolarSystem' },
      { place: { x: 0, z: 0, heading: 0 } },
      { shot: { pos: [0, 15, 30], look: [10, 0, 0] } },
      { shot: { pos: [0, 12, 25], look: [10, 0, 0], ms: 14000 } },
      { caption: 'p6.p10', fact: 'p10-neptune' },
      { caption: 'p6.p11', fact: 'p11-neptune' },
      { say: 'p6.beyond', fact: null },
    ],
    // ---- Page 7: "My Voice Fades" — Signal loss ----
    [
      { call: 'showSignalFade' },
      { place: { x: 0, z: 0, heading: 0 } },
      { shot: { pos: [4, 1.5, 4], look: [0, 0.3, 0] } },
      { shot: { pos: [3, 1, 3], look: [0, 0.3, 0], ms: 12000 } },
      { say: 'p7.power', fact: 'rtg-power' },
      { caption: 'p7.routine', fact: 'p10-routine' },
      {
        play: 'resourceManage',
        config: {
          goal: 'p7.goal',
          hint: 'p7.hint',
          seconds: 20,
          start: 0.9,
          drainPerSecond: 0.06,
          meterLabel: 'p7.meter',
          actions: [
            { label: 'p7.action.heat', gain: 0.15, cooldown: 4 },
            { label: 'p7.action.aim', gain: 0.12, cooldown: 3 },
            { label: 'p7.action.save', gain: 0.2, cooldown: 6 },
          ],
          events: [
            { at: 6, label: 'p7.event.storm', delta: -0.15, sound: 'thud' as const },
            { at: 13, label: 'p7.event.calm', delta: 0.1, sound: 'ping' as const },
          ],
          clockLabel: 'p7.clock',
          clockSpan: 30,
          winSay: 'p7.p10end',
          winFact: 'p10-last-signal',
        },
      },
      { say: 'p7.p10silence', fact: 'p10-final-search' },
      { caption: 'p7.p11end', fact: 'p11-last-contact' },
      { say: 'p7.p11silence', fact: 'p11-last-data' },
    ],
    // ---- Page 8: "The Message" — Pioneer plaque ----
    [
      { call: 'showPlaque' },
      { place: { x: 0, z: 0, heading: 0 } },
      { shot: { pos: [0, 0, 3], look: [0, 0, 1.5] } },
      { shot: { pos: [0, 0, 2.2], look: [0, 0, 1.5], ms: 10000 } },
      { say: 'p8.message', fact: 'plaque' },
      { caption: 'p8.what', fact: 'plaque-contents' },
      { say: 'p8.carry', fact: null },
    ],
    // ---- Page 9: "Goodbye" — Final words ----
    [
      { call: 'pullBack' },
      { place: { x: 0, z: 0, heading: 0 } },
      { shot: { rel: 'machine', pos: [2, 1, 2], look: [0, 0, 0] } },
      { shot: { rel: 'machine', pos: [12, 6, 12], look: [0, 0, 0], ms: 20000 } },
      { say: 'p9.p10', fact: 'p10-heading' },
      { say: 'p9.p11', fact: 'p11-heading' },
      { caption: 'p9.shared', fact: 'still-travelling' },
      { sound: 'powerDown' },
      { power: 0.05, ms: 8000 },
      { say: 'p9.bye', fact: null },
      { caption: 'p9.still', fact: 'still-travelling' },
      { caption: 'p9.next', auto: 2600 },
      { patch: true },
    ],
  ],
});
