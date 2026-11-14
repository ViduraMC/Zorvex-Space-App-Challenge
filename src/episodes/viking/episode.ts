/**
 * VIKING 1 & 2: two explorers, four machines, one question: could Mars support life?
 * Story from the team brief (docs/stories/viking.md). Every fact is in facts.json.
 * Play moments: launch both rockets, keep the cruise on course, photograph the landing sites
 * from orbit, land Viking 1 step by step, signal Earth across 19 light-minutes, run the
 * laboratory, count the images, and follow the timeline to the last signal.
 */
import { defineEpisode } from '../../engine/types';
import buildScene from './scene';

const LANDER = { x: 0, z: 0, heading: 0.4 } as const;

export default defineEpisode({
  id: 'viking',
  order: 2,
  world: 'mars',
  stages: ['earth', 'space'],
  covers: ['viking-1', 'viking-2'],
  sky: 'marsDay',
  style: 'cinematic',
  machine: { start: LANDER },
  patch: { color: '#C8702E', glyph: 'V' },
  lastContact: { date: '1982-11-13', fact: 'v1-lander-end' },
  lookUp: 'Mars',
  stats: [
    { value: '4', label: 'stat.machines' },
    { value: '52,663', label: 'stat.orbitImages' },
    { value: '4,500', label: 'stat.landerPhotos' },
    { value: '6+', label: 'stat.years' },
  ],
  scene: buildScene,
  pages: [
    // 1. The beginning: Cape Canaveral, two launches
    [
      { stage: 'earth', sky: 'earthDay' },
      { call: 'launchPose' },
      { shot: { pos: [70, 14, 90], look: [0, 22, 0] } },
      { shot: { pos: [46, 9, 62], look: [0, 20, 0], ms: 9000 } },
      { caption: 'p1.where', fact: 'launch-site' },
      { say: 'p1.hello', fact: 'pairs' },
      { say: 'p1.question', fact: 'objectives' },
      { act: 'p1.launch1' },
      { call: 'launch' },
      { caption: 'p1.went1', fact: 'launch-1' },
      { caption: 'p1.swap', fact: 'swap' },
      { call: 'launchPose' },
      { act: 'p1.launch2' },
      { call: 'launch' },
      { caption: 'p1.went2', fact: 'launch-2' },
    ],
    // 2. The journey: course corrections on the way to Mars
    [
      { stage: 'space', sky: 'space' },
      { call: 'cruisePose' },
      { call: 'cruise', block: false },
      { caption: 'p2.together', fact: 'pairs' },
      { say: 'p2.course', fact: 'corrections' },
      {
        play: 'balance',
        config: {
          goal: 'p2.goal',
          hint: 'p2.hint',
          input: 'drag',
          holdSeconds: 6,
          band: [0.38, 0.62],
          push: 0.75,
          wobble: 0.38,
          controlLabel: 'p2.thrusters',
          winSay: 'p2.win',
          winFact: 'corrections',
        },
      },
      { caption: 'p2.arrive', fact: 'arrival' },
    ],
    // 3. The watchers: orbiters photograph the landing sites
    [
      { stage: 'space', sky: 'space' },
      { call: 'orbitPose' },
      { say: 'p3.eyes', fact: 'orbiter-role' },
      { say: 'p3.check', fact: 'rough-site' },
      {
        play: 'holdToScan',
        config: {
          goal: 'p3.goal',
          hint: 'p3.hint',
          holdLabel: 'p3.hold',
          targets: [
            { at: 'siteFirstChoice', label: 'p3.first', say: 'p3.rough', fact: 'rough-site', labelLift: 1.5 },
            { at: 'siteViking1', label: 'p3.west', say: 'p3.safe', fact: 'rough-site', labelLift: 4.5 },
          ],
          holdSeconds: 2.5,
          winSay: 'p3.win',
          winFact: 'rough-site',
        },
      },
    ],
    // 4. The descent: separation, then land Viking 1 step by step
    [
      { stage: 'space', sky: 'space' },
      { call: 'separate' },
      { caption: 'p4.separate', fact: 'pairs' },
      { stage: 'mars', sky: 'marsDay' },
      { call: 'descentPose' },
      { caption: 'p4.air', fact: 'air-samples', auto: 2600 },
      {
        play: 'custom:descent',
        config: { goal: 'p4.goal', hint: 'p4.hint', winSay: 'p4.win', winFact: 'descent' },
      },
    ],
    // 5. First footprints: the signal home, and the first photo from the surface of Mars
    [
      { stage: 'mars', sky: 'marsDay' },
      { call: 'landed' },
      { place: LANDER },
      { shot: { rel: 'machine', pos: [5.5, 1.6, 6.5], look: [0, 1, 0] } },
      { shot: { rel: 'machine', pos: [4.2, 1.3, 5.2], look: [0, 1, 0], ms: 12000 } },
      { caption: 'p5.date', fact: 'landing-1' },
      {
        play: 'custom:signal',
        config: { goal: 'p5.goal', hint: 'p5.hint', minutes: 19, seconds: 6, winSay: 'p5.heard', winFact: 'landing-1' },
      },
      { caption: 'p5.apollo', fact: 'signal-time' },
      { act: 'p5.photo' },
      { call: 'firstImage' },
      { caption: 'p5.first', fact: 'first-image' },
    ],
    // 6. The laboratory: arm, biology, chemistry, weather
    [
      { stage: 'mars', sky: 'marsDay' },
      { call: 'landed' },
      { place: LANDER },
      { shot: { rel: 'machine', pos: [-4.5, 2.2, 5.5], look: [0, 1, 0] } },
      { shot: { rel: 'machine', pos: [-3.6, 1.8, 4.6], look: [0, 1, 0], ms: 10000 } },
      { say: 'p6.legs', fact: 'lander-body' },
      { say: 'p6.lab', fact: 'first-life-search' },
      {
        play: 'holdToScan',
        config: {
          goal: 'p6.goal',
          hint: 'p6.hint',
          holdLabel: 'p6.hold',
          targets: [
            { at: 'soil', label: 'p6.t.soil', say: 'p6.s.soil', fact: 'sampler', labelLift: 0.3 },
            { at: 'biolab', label: 'p6.t.bio', say: 'p6.s.bio', fact: 'biology', labelLift: 0.2 },
            { at: 'gcms', label: 'p6.t.gcms', say: 'p6.s.gcms', fact: 'soil', labelLift: 0.2 },
            { at: 'weatherBoom', label: 'p6.t.weather', say: 'p6.s.weather', fact: 'weather', labelLift: 0.2 },
          ],
          need: 3,
          holdSeconds: 2.2,
          winSay: 'p6.result',
          winFact: 'biology',
        },
      },
    ],
    // 7. The twin: Viking 2 at Utopia Planitia
    [
      { stage: 'mars', sky: 'marsAfternoon' },
      { call: 'viking2Site' },
      { shot: { rel: 'machine', pos: [8, 2.5, 7], look: [0, 0.9, 0] } },
      { shot: { rel: 'machine', pos: [5.5, 1.6, 5.4], look: [0, 0.9, 0], ms: 11000 } },
      { caption: 'p7.land', fact: 'landing-2' },
      { say: 'p7.tilt', fact: 'landing-2' },
    ],
    // 8. What Mars revealed: the images, and both sites on the globe
    [
      { stage: 'space', sky: 'space' },
      { call: 'globePose' },
      { call: 'siteLabels', block: false },
      { say: 'p8.photos', fact: 'images' },
      {
        play: 'counterRace',
        config: {
          goal: 'p8.goal',
          hint: 'p8.hint',
          plan: 4500,
          actual: 52663,
          unit: 'p8.unit',
          planLabel: 'p8.planChip',
          tapLabel: 'p8.tap',
          planSfx: 'sfx.more',
          winSfx: 'sfx.mapped',
          winSay: 'p8.map',
          winFact: 'images',
        },
      },
      { caption: 'p8.valles', fact: 'valles' },
      { caption: 'p8.apart', fact: 'landing-2' },
    ],
    // 9. The long watch, and the silence
    [
      { stage: 'mars', sky: 'marsAfternoon' },
      { call: 'landed' },
      { place: LANDER },
      { shot: { rel: 'machine', pos: [6.5, 2.4, 7.5], look: [0, 1, 0] } },
      { caption: 'p9.longer', fact: 'primary-mission' },
      {
        play: 'custom:timeline',
        config: { goal: 'p9.goal', hint: 'p9.hint', winSfx: 'sfx.silence' },
      },
      { say: 'p9.quiet', fact: 'v1-lander-end' },
    ],
    // 10. Goodbye and legacy
    [
      { stage: 'mars' },
      { sky: 'marsDusk', ms: 4000 },
      { call: 'landed' },
      { place: LANDER },
      { power: 0.05 },
      { shot: { rel: 'machine', pos: [3.5, 1.2, 4.5], look: [0, 1, 0] } },
      { shot: { rel: 'machine', pos: [18, 9, 22], look: [0, 1, 0], ms: 24000 } },
      { say: 'p10.result', fact: 'biology' },
      { say: 'p10.record', fact: 'images' },
      { caption: 'p10.names', fact: 'memorials' },
      { caption: 'p10.last', auto: 3200 },
      { patch: true },
    ],
  ],
});
