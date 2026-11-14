/**
 * DEV ONLY (never shipped): one page per mini-game that the Sojourner episode does not use,
 * on the Moon, in the cinematic style. Open http://localhost:5173/#ep-_playground to try the kit.
 * The numbers here are test values, not verified facts: check them before copying.
 */
import { defineEpisode } from '../../engine/types';

export default defineEpisode({
  id: '_playground',
  order: 99,
  world: 'moon',
  sky: 'moonDay',
  style: 'cinematic',
  machine: {},
  patch: { color: '#7d8597', glyph: 'K' },
  lookUp: 'Moon',
  pages: [
    [
      { shot: { pos: [5, 1.6, 4], look: [0, 0.4, 0] } },
      { shot: { pos: [3, 1, 2.4], look: [0, 0.4, 0], ms: 8000 } },
      { caption: 'intro' },
      { choice: [{ label: 'pick.a', say: 'pick.aSay', fact: null }, { label: 'pick.b' }] },
    ],
    [
      {
        play: 'directDrive',
        config: {
          goal: 'drive.goal',
          hint: 'drive.hint',
          checkpoints: [
            [5, 0, 0],
            [8, 0, 5],
            [2, 0, 7],
          ],
          radius: 1.2,
          speed: 3.2,
          gravity: 1.62,
          bounce: 0.8,
          bounds: 40,
          landFx: 'moonDust',
        },
      },
    ],
    [
      {
        play: 'timingTap',
        config: {
          goal: 'echo.goal',
          hint: 'echo.hint',
          mode: 'echo',
          seconds: 2.56,
          rounds: 2,
          toleranceMs: 350,
          tapLabel: 'echo.catch',
          fireLabel: 'echo.fire',
        },
      },
    ],
    [
      {
        play: 'timingTap',
        config: { goal: 'dip.goal', hint: 'dip.hint', mode: 'dip', seconds: 3, rounds: 3, toleranceMs: 220, tapLabel: 'dip.tap' },
      },
    ],
    [
      { shot: { pos: [4, 1.5, 4], look: [0, 1.4, 0] } },
      {
        play: 'balance',
        config: {
          goal: 'hover.goal',
          hint: 'hover.hint',
          input: 'hold',
          holdSeconds: 6,
          band: [0.55, 0.8],
          push: 0.55,
          fall: 0.4,
          wobble: 0.12,
          controlLabel: 'hover.hold',
          readout: 'hover.rpm',
          unitMax: 2900,
          lift: 3,
        },
      },
    ],
    [
      {
        play: 'balance',
        config: {
          goal: 'sun.goal',
          hint: 'sun.hint',
          input: 'drag',
          holdSeconds: 6,
          band: [0.4, 0.6],
          push: 0.5,
          wobble: 0.3,
          controlLabel: 'sun.slide',
        },
      },
    ],
    [
      {
        play: 'resourceManage',
        config: {
          goal: 'power.goal',
          hint: 'power.hint',
          seconds: 20,
          start: 0.6,
          drainPerSecond: 0.06,
          meterLabel: 'power.meter',
          actions: [
            { label: 'power.tilt', gain: 0.18, cooldown: 3 },
            { label: 'power.nap', gain: 0.3, cooldown: 8, sfx: 'power.zzz' },
          ],
          events: [
            { at: 7, label: 'power.devil', delta: 0.25 },
            { at: 13, label: 'power.storm', delta: -0.3 },
          ],
          clockLabel: 'power.sol',
          clockSpan: 100,
        },
      },
    ],
    [{ caption: 'done', auto: 1500 }, { patch: true }],
  ],
});
