/**
 * SPIRIT AND OPPORTUNITY: the twin robot geologists that showed Mars once had water (2004 to 2018).
 * Every fact is in facts.json (the NASA Spirit and Opportunity page, a challenge resource, and its
 * instruments and science highlights pages). Voices: Spirit ("machine") and Opportunity.
 * Play moments: grind and read Spirit's rocks, find Opportunity's blueberries, keep the panels
 * clean with the wind, and drive Opportunity across the plains.
 */
import { defineEpisode } from '../../engine/types';
import buildScene, { BERRY_FIELD, CHECKPOINTS, START } from './scene';

const BERRIES = { x: BERRY_FIELD.x - 1.4, z: BERRY_FIELD.z - 1.4, heading: 0.8 } as const;

export default defineEpisode({
  id: 'mer',
  order: 3,
  world: 'mars',
  covers: ['spirit', 'opportunity'],
  sky: 'marsDay',
  style: 'cinematic',
  machine: { start: START },
  patch: { color: '#B5562A', glyph: 'SO' },
  anatomy: 'mer-opportunity',
  lastContact: { date: '2018-06-10', fact: 'endings' },
  lookUp: 'Mars',
  stats: [
    { value: '2', label: 'stat.twins' },
    { value: '45.16', label: 'stat.opportunity' },
    { value: '7.7', label: 'stat.spirit' },
    { value: '2004', label: 'stat.landed' },
  ],
  scene: buildScene,
  pages: [
    // 1. The twins
    [
      { call: 'twins' },
      { place: START },
      { power: 1 },
      { shot: { pos: [3.5, 1.6, 5], look: [-1.2, 0.6, 0.6] } },
      { shot: { pos: [2.6, 1.2, 4], look: [-1.2, 0.6, 0.6], ms: 12000 } },
      { caption: 'p1.where', fact: 'landings' },
      { say: 'p1.spirit', fact: 'twins' },
      { say: 'p1.opportunity', fact: 'twins', by: 'opportunity' },
      { say: 'p1.job', fact: 'twins' },
      { caption: 'p1.apart', fact: 'landings' },
    ],
    // 2. Spirit at Gusev Crater: grind and read the rocks
    [
      { call: 'solo' },
      { place: START },
      { power: 1 },
      { shot: { pos: [4, 3, 5], look: [-1, 0.3, -3] } },
      { caption: 'p2.where', fact: 'gusev' },
      { say: 'p2.eyes', fact: 'pancam' },
      { say: 'p2.tools', fact: 'rat' },
      { say: 'p2.read', fact: 'apxs' },
      {
        play: 'holdToScan',
        config: {
          goal: 'p2.goal',
          hint: 'p2.hint',
          holdLabel: 'p2.hold',
          targets: [
            { at: 'comanche', label: 'p2.t.comanche', say: 'p2.s.comanche', fact: 'comanche', standoff: 1.4, labelLift: 0.9 },
            { at: 'homeplate', label: 'p2.t.homeplate', say: 'p2.s.homeplate', fact: 'silica', standoff: 1.1, labelLift: 0.4 },
          ],
          holdSeconds: 2.5,
          msPerMetre: 700,
          winSay: 'p2.win',
          winFact: 'home-plate',
        },
      },
    ],
    // 3. Opportunity at Meridiani Planum: find the blueberries
    [
      { call: 'solo' },
      { sky: 'marsAfternoon', ms: 2000 },
      { place: BERRIES },
      { power: 1 },
      { shot: { pos: [BERRY_FIELD.x + 3.2, 1.8, BERRY_FIELD.z + 3.4], look: [BERRY_FIELD.x - 0.6, 0.3, BERRY_FIELD.z - 0.6] } },
      { caption: 'p3.where', fact: 'meridiani' },
      { say: 'p3.hole', fact: 'blueberries', by: 'opportunity' },
      {
        play: 'findHidden',
        config: {
          goal: 'p3.goal',
          hint: 'p3.hint',
          items: ['b0', 'b1', 'b2', 'b3', 'b4'],
          decoys: ['p0', 'p1', 'p2', 'p3'],
          need: 4,
          missSay: 'p3.miss',
          camera: { pos: [BERRY_FIELD.x + 2.4, 2.6, BERRY_FIELD.z + 2.4], look: [BERRY_FIELD.x, 0, BERRY_FIELD.z] },
          winSay: 'p3.win',
          winFact: 'blueberries',
        },
      },
      { say: 'p3.acid', fact: 'acidic', by: 'opportunity' },
    ],
    // 4. Dust on the panels, and the wind that cleans them
    [
      { call: 'solo' },
      { place: BERRIES },
      { power: 1 },
      { shot: { rel: 'machine', pos: [2.6, 1.6, 2.6], look: [0, 0.6, 0] } },
      { say: 'p4.solar', fact: 'endings', by: 'opportunity' },
      {
        play: 'resourceManage',
        config: {
          goal: 'p4.goal',
          hint: 'p4.hint',
          seconds: 20,
          start: 0.8,
          drainPerSecond: 0.06,
          meterLabel: 'p4.meter',
          actions: [
            { label: 'p4.rest', gain: 0.12, cooldown: 3 },
            { label: 'p4.sun', gain: 0.08, cooldown: 2 },
          ],
          events: [
            { at: 6, label: 'p4.dust', delta: -0.2, sound: 'hiss' },
            { at: 12, label: 'p4.wind', delta: 0.35, sound: 'chime' },
            { at: 17, label: 'p4.dust', delta: -0.15, sound: 'hiss' },
          ],
          clockLabel: 'p4.clock',
          clockSpan: 30,
          winSay: 'p4.win',
          winFact: 'wind',
        },
      },
    ],
    // 5. PLAY: drive Opportunity across the plains
    [
      { call: 'solo' },
      { place: START },
      { power: 1 },
      { shot: { rel: 'machine', pos: [-3, 1.6, 3], look: [0, 0.5, 0] } },
      { say: 'p5.drive', fact: 'distance', by: 'opportunity' },
      {
        play: 'directDrive',
        config: {
          goal: 'p5.goal',
          hint: 'p5.hint',
          checkpoints: CHECKPOINTS,
          radius: 1.3,
          speed: 2.6,
          gravity: 3.71,
          bounce: 0.4,
          bounds: 40,
          landFx: 'dustPuff',
          winSay: 'p5.win',
          winFact: 'distance',
        },
      },
      { caption: 'p5.record', fact: 'distance' },
      { say: 'p5.water', fact: 'water' },
    ],
    // 6. Goodbye: Spirit at Home Plate, Opportunity in the great dust storm
    [
      { call: 'solo' },
      { sky: 'marsDusk', ms: 5000 },
      { place: START },
      { power: 1 },
      { shot: { rel: 'machine', pos: [2.4, 0.8, 2.8], look: [0, 0.6, 0] } },
      { shot: { rel: 'machine', pos: [11, 5, 12], look: [0, 0.6, 0], ms: 24000 } },
      { caption: 'p6.spirit', fact: 'endings' },
      { say: 'p6.rest', fact: 'home-plate' },
      { caption: 'p6.storm', fact: 'endings' },
      { power: 0.05, ms: 6000 },
      { say: 'p6.bye', fact: null, by: 'opportunity' },
      { caption: 'p6.still', auto: 3600 },
      { patch: true },
    ],
  ],
});
