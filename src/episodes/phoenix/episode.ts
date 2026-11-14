/**
 * PHOENIX: the lander that touched water ice in the Martian arctic (2008).
 * Every fact is in facts.json (the NSSDCA Phoenix page, a challenge catalogue page, and NASA's
 * Phoenix mission page). Play moments: land on parachute and thrusters, open the solar wings, dig
 * the trench and watch the ice vanish, run the ovens and the wet lab, and count the days.
 */
import { defineEpisode } from '../../engine/types';
import buildScene, { LANDER, TRENCH } from './scene';

const TRENCH_LOOK: [number, number, number] = [TRENCH.x, 0.1, TRENCH.z];

export default defineEpisode({
  id: 'phoenix',
  order: 4,
  world: 'mars',
  sky: 'marsDay',
  style: 'cinematic',
  machine: { start: LANDER },
  patch: { color: '#C2A35A', glyph: 'PX' },
  lastContact: { date: '2008-11-02', fact: 'end' },
  lookUp: 'Mars',
  stats: [
    { value: '68°', label: 'stat.north' },
    { value: '90', label: 'stat.planned' },
    { value: '161', label: 'stat.days' },
    { value: '55', label: 'stat.payload' },
  ],
  scene: buildScene,
  pages: [
    // 1. Arrival: parachute, thrusters, touchdown in the arctic
    [
      { call: 'arrive' },
      { place: LANDER },
      { power: 1 },
      { shot: { pos: [10, 3, 12], look: [0, 5.5, 0] } },
      { caption: 'p1.launch', fact: 'launch' },
      { say: 'p1.hello', fact: 'goal' },
      { act: 'p1.land' },
      { shot: { pos: [8, 2.5, 9], look: [0, 1, 0], ms: 6000 }, block: false },
      { call: 'descend' },
      { sfx: 'sfx.touchdown' },
      { say: 'p1.how', fact: 'descent' },
      { caption: 'p1.where', fact: 'landing' },
      { caption: 'p1.call', fact: 'signal' },
    ],
    // 2. Wait for the dust, then open the wings
    [
      { call: 'landed' },
      { place: LANDER },
      { power: 1 },
      { shot: { pos: [4, 2.4, 4.5], look: [0, 1, 0] } },
      { say: 'p2.wait', fact: 'dust' },
      { act: 'p2.open' },
      { call: 'unfurl' },
      { say: 'p2.body', fact: 'body' },
      { say: 'p2.look', fact: 'dust' },
      { caption: 'p2.days', fact: 'first-days' },
    ],
    // 3. PLAY: dig the trench, then watch the bright clumps vanish
    [
      { call: 'ready' },
      { place: LANDER },
      { power: 1 },
      { shot: { pos: [3.6, 1.4, 2.4], look: TRENCH_LOOK } },
      { say: 'p3.ice', fact: 'goal' },
      {
        play: 'holdToScan',
        config: {
          goal: 'p3.goal',
          hint: 'p3.hint',
          holdLabel: 'p3.hold',
          targets: [{ at: [TRENCH.x, 0, TRENCH.z], label: 'p3.t.trench', say: 'p3.s.trench', fact: 'ice', labelLift: 0.4 }],
          holdSeconds: 2.5,
          winSay: 'p3.dug',
          winFact: 'ice',
        },
      },
      { call: 'dig' },
      { say: 'p3.bright', fact: 'ice' },
      { act: 'p3.watch' },
      { call: 'vanish' },
      { say: 'p3.vanish', fact: 'ice' },
    ],
    // 4. PLAY: the ovens and the wet lab
    [
      { call: 'ready' },
      { place: LANDER },
      { power: 1 },
      { shot: { pos: [3.4, 3, 3.6], look: [0, 1, 0.2] } },
      { say: 'p4.lab', fact: 'tega' },
      {
        play: 'holdToScan',
        config: {
          goal: 'p4.goal',
          hint: 'p4.hint',
          holdLabel: 'p4.hold',
          targets: [
            { at: 'tega', label: 'p4.t.tega', say: 'p4.s.tega', fact: 'tega', labelLift: 0.3 },
            { at: 'meca', label: 'p4.t.meca', say: 'p4.s.meca', fact: 'wet-lab', labelLift: 0.3 },
          ],
          holdSeconds: 2.5,
          winSay: 'p4.win',
          winFact: 'perchlorate',
        },
      },
      { caption: 'p4.life', fact: 'perchlorate' },
    ],
    // 5. PLAY: the summer sun, and the days it kept working
    [
      { call: 'ready' },
      { place: LANDER },
      { power: 1 },
      { shot: { pos: [5, 2, -4], look: [0, 1, 0] } },
      { say: 'p5.sun', fact: 'sun' },
      {
        play: 'counterRace',
        config: {
          goal: 'p5.goal',
          hint: 'p5.hint',
          plan: 90,
          actual: 161,
          unit: 'p5.unit',
          planLabel: 'p5.planChip',
          tapLabel: 'p5.tap',
          taps: 12,
          planSfx: 'sfx.more',
          winSay: 'p5.win',
          winFact: 'days',
        },
      },
      { caption: 'p5.extended', fact: 'mission' },
    ],
    // 6. The arctic winter comes
    [
      { sky: 'marsDusk', ms: 5000 },
      { call: 'ready' },
      { place: LANDER },
      { power: 1 },
      { shot: { pos: [3, 1.5, 3.4], look: [0, 1, 0] } },
      { shot: { pos: [12, 6, 13], look: [0, 1, 0], ms: 24000 } },
      { say: 'p6.dark', fact: 'end' },
      { power: 0.05, ms: 6000 },
      { caption: 'p6.last', fact: 'end' },
      { say: 'p6.bye', fact: null },
      { caption: 'p6.still', auto: 3600 },
      { patch: true },
    ],
  ],
});
