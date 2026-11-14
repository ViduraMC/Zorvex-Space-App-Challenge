/**
 * SOJOURNER + Pathfinder lander, Mars, 1997. The pilot episode.
 * Play moments: plan-and-send driving (signal delay), rock scanning (APXS), finding the rounded
 * pebbles (the water clue), and pushing 7 planned days to the 83 it really worked.
 * Every `fact` id points into facts.json; every text key into i18n/<lang>.json.
 */
import { defineEpisode } from '../../engine/types';
import buildScene, { RAMP_FOOT, ROVER_START } from './scene';

/** Where the rover stops to study Barnacle Bill, its first rock. */
const FIRST_ROCK_STOP = { x: 3.74, z: 0.72 };

export default defineEpisode({
  id: 'sojourner',
  order: 1,
  world: 'mars',
  sky: 'marsAfternoon',
  style: 'comic',
  machine: { start: ROVER_START },
  patch: { color: '#E8402A', glyph: 'S' },
  lastContact: { date: '1997-09-27', fact: 'last-contact' },
  lookUp: 'Mars',
  clear: { x0: 1.2, x1: 6.6, z0: -3.8, z1: 3.8 },
  stats: [
    { value: '7', label: 'stat.planned' },
    { value: '83', label: 'stat.worked' },
    { value: '100 m', label: 'stat.driven' },
    { value: '1 cm/s', label: 'stat.speed' },
  ],
  scene: buildScene,
  pages: [
    // 1. The landing: wide establishing shot, the airbag ball bounces in
    [
      { call: 'arrive' },
      { call: 'landerAwake' },
      { sky: 'marsDay' },
      { place: ROVER_START },
      { power: 0.25 },
      { shot: { pos: [10.5, 2.6, 8], look: [0.4, 0.5, 0] } },
      { shot: { pos: [7.2, 1.7, 5.6], look: [0.6, 0.5, 0], ms: 14000 } },
      { caption: 'p1.date', fact: 'landing', auto: 2200 },
      { call: 'bounceIn' },
      { caption: 'p1.bounce', fact: 'bounces' },
      { sfx: 'sfx.clunk', sound: 'thud' },
      { call: 'openPetals' },
      { caption: 'p1.petals', fact: 'petals' },
    ],
    // 2. The machine wakes up and rolls onto Mars
    [
      { call: 'landed' },
      { place: ROVER_START },
      { power: 1, ms: 1200 },
      { sfx: 'sfx.beep', sound: 'beep' },
      { shot: { pos: [3.3, 0.6, 1.7], look: [1.0, 0.32, 0] } },
      { shot: { pos: [2.9, 0.5, 1.45], look: [1.0, 0.3, 0], ms: 12000 } },
      { say: 'p2.hello', fact: null },
      { say: 'p2.size', fact: 'size' },
      { act: 'p2.roll' },
      { sfx: 'sfx.whirr' },
      { shot: { pos: [4.6, 0.7, 2.6], look: [1.0, 0.3, 0], ms: 7000, follow: 'machine' } },
      { call: 'rollDown' },
      { sfx: 'sfx.bump', sound: 'thud' },
      { fx: 'dustPuff', at: 'machine' },
      { say: 'p2.wheels', fact: 'first-wheels' },
    ],
    // 3. PLAY: "Send to Mars". Plan a path, send it, wait out the signal delay
    [
      { call: 'landed' },
      { place: { ...RAMP_FOOT, heading: 0 } },
      { shot: { pos: [4.25, 0.16, 1.05], look: [3.35, 0.2, 0] } },
      { shot: { pos: [4.6, 0.2, 0.75], look: [3.35, 0.2, 0], ms: 12000 } },
      { say: 'p3.slow', fact: 'speed' },
      { say: 'p3.delay', fact: 'delay' },
      { say: 'p3.plan', fact: 'commanded' },
      {
        play: 'waypointDrive',
        config: {
          goal: 'p3.goal',
          hint: 'p3.hint',
          goalAt: [FIRST_ROCK_STOP.x, 0, FIRST_ROCK_STOP.z],
          goalRadius: 0.4,
          obstacles: [
            { at: 'yogi', radius: 0.95 },
            { at: 'scoobyDoo', radius: 0.6 },
            { at: 'barnacleBill', radius: 0.3 },
          ],
          maxWaypoints: 3,
          delayMinutes: 11,
          delaySeconds: 4,
          msPerMetre: 1400,
          camera: { pos: [4.3, 5.4, 4.2], look: [4.3, 0, 0.4] },
          winSay: 'p3.win',
          winFact: 'delay',
        },
      },
    ],
    // 4. PLAY: "Rock reader". Hold the sensor on the rocks
    [
      { call: 'landed' },
      { place: FIRST_ROCK_STOP },
      { shot: { pos: [1.4, 2.6, 5.6], look: [4.3, 0.2, 0.5] } },
      { shot: { pos: [1.9, 2.3, 5.1], look: [4.3, 0.2, 0.5], ms: 9000 } },
      { say: 'p4.names', fact: 'rock-names' },
      { say: 'p4.apxs', fact: 'apxs' },
      {
        play: 'holdToScan',
        config: {
          goal: 'p4.goal',
          hint: 'p4.hint',
          targets: [
            { at: 'barnacleBill', label: 'rock.barnacleBill', say: 'p4.barnacleBill', fact: 'barnacle-bill', standoff: 0.55, labelLift: 0.35 },
            { at: 'yogi', label: 'rock.yogi', say: 'p4.yogi', fact: 'yogi', standoff: 1.05, labelLift: 0.75 },
            { at: 'scoobyDoo', label: 'rock.scoobyDoo', say: 'p4.scoobyDoo', fact: 'scooby-doo', standoff: 0.7, labelLift: 0.3 },
          ],
          holdSeconds: 3,
          need: 2,
          msPerMetre: 900,
          camera: { pos: [1.9, 2.9, 5.6], look: [4.3, 0.2, 0.5] },
          winSay: 'p4.win',
          winFact: 'apxs',
        },
      },
    ],
    // 5. PLAY: "Find the clue". The discovery: rounded pebbles, a hint of ancient water
    [
      { call: 'landed' },
      { place: { x: 3.85, z: 0.3, heading: 0 } },
      { shot: { pos: [4.72, 1.0, 2.5], look: [4.72, 0.05, 0.4] } },
      { say: 'p5.look', fact: null },
      {
        play: 'findHidden',
        config: {
          goal: 'p5.goal',
          hint: 'p5.hint',
          items: ['pebble1', 'pebble2', 'pebble3'],
          decoys: ['sharp1', 'sharp2', 'sharp3', 'sharp4'],
          missSay: 'p5.miss',
          camera: { pos: [4.72, 1.15, 2.2], look: [4.72, 0.02, 0.42] },
          winSfx: 'sfx.clue',
          winSay: 'p5.water',
          winFact: 'pebbles',
        },
      },
      { say: 'p5.wet', fact: 'pebbles' },
    ],
    // 6. PLAY: seven planned days become eighty-three
    [
      { call: 'landed' },
      { sky: 'marsDay' },
      { shot: { rel: 'machine', pos: [2.4, 1.6, 4.4], look: [0, 0.3, 0] } },
      { shot: { rel: 'machine', pos: [2.0, 1.35, 3.9], look: [0, 0.3, 0], ms: 9000 } },
      { caption: 'p6.plan', fact: 'lifetime' },
      {
        play: 'counterRace',
        config: {
          goal: 'p6.goal',
          hint: 'p6.hint',
          plan: 7,
          actual: 83,
          unit: 'p6.day',
          planLabel: 'p6.planChip',
          tapLabel: 'p6.tap',
          dayNight: true,
          winSfx: 'sfx.day83',
          winSay: 'p6.win',
          winFact: 'lifetime',
        },
      },
      { sky: 'marsDay', ms: 600 },
      { say: 'p6.far', fact: 'distance' },
    ],
    // 7. The emotional beat: a blue sunset, and the lander goes quiet
    [
      { call: 'landed' },
      { sky: 'marsDusk', ms: 5000 },
      { call: 'landerQuiet' },
      { shot: { rel: 'machine', pos: [-1.36, 0.55, 1.84], look: [1.18, 0.45, -1.6] } },
      { shot: { rel: 'machine', pos: [-1.66, 0.62, 2.24], look: [1.18, 0.5, -1.6], ms: 14000 } },
      { caption: 'p7.blue', fact: 'blue-sunset' },
      { caption: 'p7.quiet', fact: 'last-contact' },
      { say: 'p7.hello', fact: 'relay' },
      { say: 'p7.backup', fact: 'backup-plan' },
    ],
    // 8. Relay hand-off: who came after, and the teaser for the next signal
    [
      { call: 'landed' },
      { call: 'landerQuiet' },
      { sky: 'marsNight', ms: 6000 },
      { shot: { rel: 'machine', pos: [1.6, 0.5, 1.7], look: [0, 0.3, 0] } },
      { shot: { rel: 'machine', pos: [1.35, 0.42, 1.5], look: [0, 0.32, 0], ms: 14000 } },
      { say: 'p8.sad', fact: null },
      { say: 'p8.after', fact: 'successors' },
      { say: 'p8.tracks', fact: 'successors' },
    ],
    // 9. Goodbye: crane-out, the eyes dim, the patch is earned
    [
      { call: 'landed' },
      { sky: 'marsNight', ms: 2000 },
      { shot: { rel: 'machine', pos: [1.7, 0.6, 1.8], look: [0, 0.3, 0] } },
      { shot: { rel: 'machine', pos: [6.5, 4.4, 7.0], look: [0, 0.3, 0], ms: 26000 } },
      { say: 'p9.done', fact: null },
      { sound: 'powerDown' },
      { power: 0.06, ms: 8000 },
      { say: 'p9.bye', fact: null },
      { caption: 'p9.still', fact: 'still-there' },
      { caption: 'p9.next', auto: 2600 },
      { patch: true },
    ],
  ],
});
