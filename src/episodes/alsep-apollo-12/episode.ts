/**
 * ALSEP · Apollo 12 · "Eight Years in the Ocean of Storms"
 *
 * Narrator: the ALSEP Central Station, Moon, Oceanus Procellarum.
 * Style: cinematic.
 * 4 acts: Start → Work Done → Timeline → Goodbye.
 *
 * Camera convention (from director.ts):
 *   shot.pos  = world position of the camera
 *   shot.look = world position the camera looks AT (not a direction!)
 *   FOV = 38° (narrow). Keep subjects 3–10 m from the camera.
 *
 * Scene layout (scene.ts):
 *   ALSEP station   (0,   0,   0)
 *   RTG             (2,   0,   1)
 *   Intrepid        (12,  0,  -8)   ~14 m away
 *   Surveyor 3      (20, -1,  14)   ~25 m SE
 *
 * Sources: NASA NSSDCA 1969-099C, 1969-099A, 1967-035A.
 */
import { defineEpisode } from '../../engine/types';
import buildScene from './scene';

/** Lunar night: pitch-black sky, stars visible, sun below horizon. */
const MOON_NIGHT = { day: 0, sunset: 0, az: 0 } as const;

export default defineEpisode({
  id: 'alsep-apollo-12',
  order: 10,
  world: 'moon',
  sky: 'moonDay',
  style: 'cinematic',
  machine: {
    start: { x: 0, z: 0 },
  },
  patch: { color: '#1a3a6b', glyph: 'A12' },
  lastContact: { date: '1977-09-30', fact: 'alsep-shutdown' },
  lookUp: 'Moon',
  stats: [
    { value: '~8', label: 'stat.operated' },
    { value: '6',  label: 'stat.instruments' },
    { value: '25', label: 'stat.mass' },
    { value: '70', label: 'stat.power' },
  ],
  scene: buildScene,
  pages: [

    // ═══════════════════════════════════════════════════════════════════════
    // ACT 1  START — nuclear warmth wakes the narrator
    // ═══════════════════════════════════════════════════════════════════════

    // 1 · Boot: eyes open on the moonscape; camera looks across ALSEP toward horizon
    [
      { call: 'boot' },
      { place: { x: 0, z: 0, heading: 0 } },
      { sky: 'moonDay' },
      // Camera 5 m south of ALSEP, low angle, looking at the station from outside
      { shot: { pos: [-3, 1.8, 6], look: [0, 1.2, 0] } },
      { power: 0, ms: 0 },
      { wait: 1500 },
      { sfx: 'sfx.warmup' },
      { power: 1, ms: 3000 },
      { caption: 'p1.boot', fact: 'alsep-on', auto: 2000 },
      { say: 'p1.wake', fact: 'snap-27' },
    ],

    // 2 · The astronauts finish work; camera looks toward Intrepid
    [
      { call: 'boot' },
      { place: { x: 0, z: 0, heading: 0 } },
      { sky: 'moonDay' },
      // Camera behind ALSEP looking ENE at Intrepid (~14 m away)
      { shot: { pos: [-2, 2.5, 5], look: [12, 1.5, -8] } },
      { shot: { pos: [-2, 2.0, 4], look: [12, 2.5, -8], ms: 10000 } },
      { say: 'p1.astronauts', fact: 'tv-camera' },
      { caption: 'p1.hatch', fact: 'hatch-closed', auto: 3000 },
    ],

    // 3 · Turn to look toward Surveyor 3 crater and the Earth in the sky
    [
      { call: 'boot' },
      { place: { x: 0, z: 0, heading: 0 } },
      { sky: 'moonDay' },
      // Camera behind ALSEP looking SE toward Surveyor
      { shot: { pos: [-2, 2.5, -4], look: [20, 1.0, 14] } },
      { shot: { pos: [-2, 2.0, -3], look: [20, 2.5, 14], ms: 4000 } },
      { say: 'p1.turn', fact: 'surveyor-3' },
    ],

    // 4 · Origin memory — transition into Act 2
    [
      { call: 'boot' },
      { place: { x: 0, z: 0, heading: 0 } },
      { sky: MOON_NIGHT },
      // Close-up of the ALSEP antenna mast at night, stars behind
      { shot: { pos: [3, 2.5, 4], look: [0, 1.5, 0] } },
      { say: 'p1.origin', fact: 'launch' },
      { act: 'p1.go' },
    ],

    // ═══════════════════════════════════════════════════════════════════════
    // ACT 2  WORK DONE — every machine as a "memory ghost" card
    // ═══════════════════════════════════════════════════════════════════════

    // 5 · Saturn V card — camera tilts up into the night sky
    [
      { call: 'boot' },
      { place: { x: 0, z: 0, heading: 0 } },
      { sky: MOON_NIGHT },
      // Looking up at an empty sky to invoke the rocket memory
      { shot: { pos: [3, 1.5, 4], look: [0, 8, -6] } },
      { shot: { pos: [3, 1.5, 4], look: [0, 14, -8], ms: 10000 } },
      { say: 'p2.intro', fact: 'launch' },
    ],

    // 6 · Yankee Clipper card — wide shot of the moonscape
    [
      { call: 'boot' },
      { place: { x: 0, z: 0, heading: 0 } },
      { sky: MOON_NIGHT },
      // High camera looking down and across the site
      { shot: { pos: [-5, 6, 10], look: [4, 0, -2] } },
      { shot: { pos: [-4, 5, 8], look: [4, 0, -2], ms: 9000 } },
      { say: 'p2.clipper', fact: 'yankee-clipper' },
    ],

    // 7 · Intrepid ascent stage card — camera close to Intrepid looking up
    [
      { call: 'boot' },
      { place: { x: 0, z: 0, heading: 0 } },
      { sky: MOON_NIGHT },
      // Camera 4 m west of Intrepid, looking at the ascent stage cabin
      { shot: { pos: [7, 2.5, -3], look: [12, 3.5, -8] } },
      { shot: { pos: [8, 2.0, -4], look: [12, 2.5, -8], ms: 9000 } },
      { say: 'p2.ascent', fact: 'impact' },
    ],

    // 8 · Intrepid descent stage card — wider view of the whole lander
    [
      { call: 'boot' },
      { place: { x: 0, z: 0, heading: 0 } },
      { sky: 'moonDay' },
      // Camera circles left side of Intrepid, looking at the full lander shape
      { shot: { pos: [5, 3.5, -1], look: [12, 1.0, -8] } },
      { shot: { pos: [6, 3.0, -2], look: [12, 1.5, -8], ms: 9000 } },
      { say: 'p2.descent', fact: 'descent-stage' },
    ],

    // 9 · Surveyor 3 card — camera close to Surveyor in the crater
    [
      { call: 'boot' },
      { place: { x: 0, z: 0, heading: 0 } },
      { sky: 'moonDay' },
      // Camera 5 m from Surveyor, looking at the robot
      { shot: { pos: [14, 2.0, 10], look: [20, 1.2, 14] } },
      { shot: { pos: [15, 1.6, 11], look: [20, 1.4, 14], ms: 9000 } },
      { say: 'p2.surveyor', fact: 'surveyor-visit' },
    ],

    // 10 · ALSEP self-card — camera orbits the station itself
    [
      { call: 'boot' },
      { place: { x: 0, z: 0, heading: 0 } },
      { sky: 'moonDay' },
      // Camera close behind the station, pulls back slightly
      { shot: { pos: [5, 3.0, 5], look: [0, 1.0, 0] } },
      { shot: { pos: [4, 2.5, 4], look: [0, 1.2, 0], ms: 9000 } },
      { say: 'p2.me', fact: 'six-instruments' },
    ],

    // 11 · Closing Act 2 — wide overhead pulling back
    [
      { call: 'boot' },
      { place: { x: 0, z: 0, heading: 0 } },
      { sky: MOON_NIGHT },
      // High overhead shot of the whole site
      { shot: { pos: [5, 12, 8], look: [6, 0, 2] } },
      { shot: { pos: [5, 10, 6], look: [6, 0, 2], ms: 10000 } },
      { say: 'p2.closing', fact: 'still-there' },
    ],

    // ═══════════════════════════════════════════════════════════════════════
    // ACT 3  TIMELINE — interactive chronology 1967–1977
    // ═══════════════════════════════════════════════════════════════════════

    // 12 · Timeline intro then counterRace mini-game
    [
      { call: 'boot' },
      { place: { x: 0, z: 0, heading: 0 } },
      { sky: 'moonDay' },
      // Camera faces the ALSEP station from the front at eye level
      { shot: { pos: [5, 2.0, 4], look: [0, 1.2, 0] } },
      { caption: 'p3.intro', fact: 'alsep-on', auto: 3500 },
      {
        play: 'counterRace',
        config: {
          goal: 'p3.play',
          hint: 'p4.winthint',
          plan: 7,
          actual: 2922,
          unit: 'p3.day',
          planLabel: 'p3.planChip',
          tapLabel: 'p4.watchgoal',
          dayNight: true,
          winSfx: 'sfx.day83',
          winSay: 'p4.watchwin',
          winFact: 'alsep-shutdown',
        },
      },
    ],

    // ═══════════════════════════════════════════════════════════════════════
    // ACT 4  GOODBYE — Intrepid leaves, moonquake, 8 years, shutdown
    // ═══════════════════════════════════════════════════════════════════════

    // 13 · Intrepid liftoff (silent – no air)
    [
      { call: 'boot' },
      { place: { x: 0, z: 0, heading: 0 } },
      { sky: 'moonDay' },
      // Camera close behind ALSEP looking at Intrepid, tilts up as it rises
      { shot: { pos: [-2, 2.5, 5], look: [12, 2.5, -8] } },
      { shot: { pos: [-2, 2.0, 4], look: [12, 10, -8], ms: 5000 }, block: false },
      { caption: 'p4.liftoff', fact: 'liftoff', auto: 1500 },
      { call: 'liftoff' },
      { say: 'p4.liftoff', fact: 'liftoff' },
    ],

    // 14 · The moonquake: camera micro-shake
    [
      { call: 'boot' },
      { place: { x: 0, z: 0, heading: 0 } },
      { sky: 'moonDay' },
      // Low angle looking across the moonscape
      { shot: { pos: [3, 1.4, 6], look: [8, 0.4, -4] } },
      { sfx: 'sfx.rumble' },
      { call: 'moonquakeShake' },
      { say: 'p4.impact', fact: 'moonquake' },
    ],

    // 15 · Eight years of day/night cycles (accelerated)
    [
      { call: 'boot' },
      { place: { x: 0, z: 0, heading: 0 } },
      { sky: 'moonDay' },
      // Camera at antenna height, looking across the instrument field
      { shot: { pos: [5, 2.5, 5], look: [0, 1.5, 0] } },
      { call: 'dayCycle' },
      { say: 'p4.watch', fact: 'splashdown' },
    ],

    // 16 · The final command and shutdown
    [
      { call: 'boot' },
      { place: { x: 0, z: 0, heading: 0 } },
      { sky: 'moonDay' },
      // Close on the ALSEP antenna – the last signal
      { shot: { pos: [4, 2.8, 4], look: [0, 2.0, 0] } },
      { say: 'p4.shutdown', fact: 'alsep-shutdown' },
    ],

    // 17 · Goodbye — slow crane shot sweeping from Intrepid toward Surveyor; eyes close
    [
      { call: 'boot' },
      { place: { x: 0, z: 0, heading: 0 } },
      { sky: MOON_NIGHT },
      // Start looking at the dark Intrepid, pan to Surveyor crater under stars
      { shot: { pos: [-3, 3.0, 5], look: [12, 1.5, -8] } },
      { shot: { pos: [-2, 4.0, 2], look: [20, 0.5, 14], ms: 8000 } },
      { say: 'p4.goodbye', fact: 'still-there' },
      { call: 'finalShutdown' },
      { power: 0, ms: 6000 },
      { sfx: 'sfx.shutdown' },
      { patch: true },
    ],
  ],
});
