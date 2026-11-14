/**
 * EASEP's four-act life story, staged through the existing episode API.
 * The scene and timeline interaction remain episode-local; the engine is unchanged.
 */
import { defineEpisode, type Step } from '../../engine/types';
import buildScene from './scene';
import { APOLLO_PARTS } from './storyData';

const partPages: Step[][] = APOLLO_PARTS.map((part) => {
  const page: Step[] = [
    { call: `part${part.id[0].toUpperCase()}${part.id.slice(1)}` },
    { say: part.narration, fact: part.factId },
  ];
  if (part.narration2 && part.factId2) page.push({ say: part.narration2, fact: part.factId2 });
  return page;
});

const actOne: Step[] = [
  { call: 'firstPerson' },
  { call: 'boot' },
  { wait: 1500 },
  { call: 'openEyes' },
  { say: 'p1.wake', fact: 'power-on' },
  { say: 'p1.panels', fact: 'solar-power' },
  { say: 'p1.returnFirst', fact: 'astronaut-return' },
  { call: 'aldrinReturns' },
  { say: 'p1.returnNext', fact: 'astronaut-return' },
  { call: 'armstrongReturns' },
  { call: 'turnAway' },
  { say: 'p1.turn', fact: null },
  { call: 'faceEagle' },
  { say: 'p1.hatch', fact: 'hatch-closed' },
  { call: 'originMemory' },
  { say: 'p1.stowed', fact: 'stowed-instruments' },
  { say: 'p1.origin', fact: 'flight-profile' },
  { call: 'beginMemory' },
  { call: 'memoryDescent' },
  { say: 'p1.descent', fact: 'powered-descent' },
  { call: 'memoryTouchdown' },
  { say: 'p1.touchdown', fact: 'landing' },
  { call: 'memoryFirstSteps' },
  { say: 'p1.firstSteps', fact: 'first-step' },
  { call: 'prepareDeployment' },
  {
    play: 'custom:deploy',
    config: {
      goal: 'deploy.sceneGoal',
      hint: 'deploy.sceneHint',
      winSfx: 'ui.sfx.win',
      winSay: 'deploy.sceneWin',
      winFact: 'deployment',
    },
  },
  { say: 'p1.unloaded', fact: 'deployment' },
  { say: 'p1.reflector', fact: 'retroreflector' },
  { call: 'memorySurfaceWork' },
  { say: 'p1.surfaceWork', fact: 'surface-work' },
  { say: 'p1.surfaceMedia', fact: 'surface-media' },
  { say: 'p1.surfaceImages', fact: 'surface-media' },
  { call: 'returnToPresent' },
  { say: 'p1.present', fact: null },
];

const actTwo: Step[][] = [
  partPages[0],
  ...partPages.slice(1),
  [
    { call: 'partClosing' },
    { say: 'p2.closing', fact: null },
  ],
];

const actThree: Step[] = [
  { call: 'firstPerson' },
  { say: 'p3.intro', fact: 'flight-profile' },
  {
    play: 'custom:timeline',
    config: {
      goal: 'timeline.goal',
      hint: 'timeline.hint',
      winSfx: 'timeline.winSfx',
      winSay: 'p3.done',
      winFact: null,
    },
  },
];

const actFour: Step[] = [
  { call: 'firstPerson' },
  { call: 'liftoff' },
  { say: 'p4.liftoff', fact: 'eagle-liftoff' },
  { say: 'p4.flag', fact: 'flag-fall' },
  { call: 'lookToEarth' },
  { say: 'p4.splashdown', fact: 'splashdown' },
  { call: 'aloneDays' },
  { say: 'p4.longDay', fact: null },
  { say: 'p4.instruments', fact: 'easep-instruments' },
  { call: 'lettersHome' },
  { say: 'p4.letters', fact: 'easep-instruments' },
  { call: 'firstNight' },
  { say: 'p4.firstNight', fact: 'easep-operation' },
  { call: 'lastDay' },
  { say: 'p4.lastDay', fact: 'terminal-failure' },
  { call: 'goodnight' },
  { say: 'p4.footprints', fact: 'footprints' },
  { say: 'p4.goodnight', fact: 'eagle-descent' },
  { sound: 'powerDown' },
  { call: 'shutdown' },
  { patch: true },
];

const acts: Step[][][] = [[actOne], actTwo, [actThree], [actFour]];
const requestedAct = Number(new URLSearchParams(window.location.search).get('act'));
const pages = Number.isInteger(requestedAct) && requestedAct >= 1 && requestedAct <= acts.length
  ? acts.slice(requestedAct - 1).flat()
  : acts.flat();

export default defineEpisode({
  id: 'apollo-11-descent-stage',
  order: 2,
  world: 'moon',
  sky: 'moonDay',
  style: 'cinematic',
  machine: { start: { x: 0, z: 0 } },
  patch: { color: '#b8c2ca', glyph: 'E' },
  lastContact: { date: '1969-08-27', fact: 'terminal-failure' },
  stats: [
    { value: '48 kg', label: 'stats.mass' },
    { value: '2', label: 'stats.lunarDays' },
  ],
  lookUp: 'Moon',
  scene: buildScene,
  pages,
});
