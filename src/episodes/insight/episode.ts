/**
 * INSIGHT: The robotic lander that listened to the interior of Mars.
 * Elysium Planitia, Mars, 2018–2022.
 * Stationary lander story told in the first person.
 */
import { defineEpisode } from '../../engine/types';
import buildScene from './scene';

export default defineEpisode({
  id: 'insight',
  order: 7,
  world: 'mars',
  sky: 'marsAfternoon',
  style: 'cinematic',
  machine: {
    model: 'insight-lander.glb',
    scale: 0.95,
    start: { x: 0, z: 0, heading: 0 },
  },
  patch: { color: '#D97736', glyph: '⚡' },
  lastContact: { date: '2022-12-15', fact: 'last-contact' },
  lookUp: 'Mars',
  stats: [
    { value: '1440', label: 'stat.sol' },
    { value: '1300+', label: 'stat.quakes' },
    { value: '6', label: 'stat.wingspan' },
    { value: '360', label: 'stat.mass' },
  ],
  scene: buildScene,
  pages: [
    // Page 1: Landing on Elysium Planitia
    [
      { call: 'arrive' },
      { sky: 'marsDay' },
      { place: { x: 0, z: 0, heading: 0 } },
      { power: 1 },
      { shot: { pos: [5, 2.5, 4.5], look: [0, 0.6, 0] } },
      { shot: { pos: [3.2, 1.4, 2.8], look: [0, 0.5, 0], ms: 10000 } },
      { caption: 'p1.date', fact: 'landing-elysium' },
      { say: 'p1.hello', fact: 'purpose-interior' },
      { sfx: 'sfx.touchdown', sound: 'thud' },
      { say: 'p1.landing', fact: 'landing-elysium' },
      { say: 'p1.marco', fact: 'marco-cubesats' },
    ],
    // Page 2: Deploying SEIS and HP3
    [
      { call: 'arrive' },
      { place: { x: 0, z: 0, heading: 0 } },
      { shot: { pos: [2.8, 1.2, 2.2], look: [0.8, 0.4, 0.4] } },
      { say: 'p2.arm', fact: 'seis-deployment' },
      { act: 'p2.deploy' },
      { sfx: 'sfx.whirr', sound: 'beep' },
      { call: 'deployInstruments' },
      { sfx: 'sfx.clunk', sound: 'thud' },
      { say: 'p2.seis', fact: 'seis-deployment' },
      { say: 'p2.listen', fact: 'purpose-interior' },
    ],
    // Page 3: Catching Marsquakes (Mini-game: timingTap)
    [
      { call: 'ready' },
      { place: { x: 0, z: 0, heading: 0 } },
      { shot: { pos: [2.4, 0.8, 1.8], look: [1.2, 0.2, 0.6] } },
      { caption: 'p3.intro', fact: 'marsquakes-count' },
      {
        play: 'timingTap',
        config: {
          goal: 'p3.goal',
          hint: 'p3.hint',
          mode: 'echo',
          seconds: 2.5,
          rounds: 2,
          toleranceMs: 500,
          tapLabel: 'p3.tap',
          hitSfx: 'sfx.pulse',
          winSay: 'p3.quakes',
          winFact: 'marsquakes-count',
        },
      },
      { call: 'quake' },
      { say: 'p3.rise', fact: 'rise-core' },
    ],
    // Page 4: The Mole struggle and Gathering Dust
    [
      { call: 'ready' },
      { place: { x: 0, z: 0, heading: 0 } },
      { sky: 'marsDusk', ms: 5000 },
      { shot: { pos: [2.6, 1.1, -1.8], look: [0.8, 0.3, -0.6] } },
      { say: 'p4.mole', fact: 'hp3-mole' },
      { say: 'p4.struggle', fact: 'hp3-mole' },
      { power: 0.4, ms: 6000 },
      { say: 'p4.dust', fact: 'dust-power' },
    ],
    // Page 5: Final Contact and Mission Legacy
    [
      { call: 'ready' },
      { sky: 'marsNight', ms: 4000 },
      { place: { x: 0, z: 0, heading: 0 } },
      { shot: { pos: [2.2, 0.9, 2.2], look: [0, 0.5, 0] } },
      { shot: { pos: [7.5, 4.2, 6.8], look: [0, 0.4, 0], ms: 22000 } },
      { caption: 'p5.last', fact: 'last-contact' },
      { sound: 'powerDown' },
      { power: 0.05, ms: 8000 },
      { say: 'p5.bye', fact: null },
      { caption: 'p5.still', fact: 'landing-elysium' },
      { patch: true },
    ],
  ],
});
