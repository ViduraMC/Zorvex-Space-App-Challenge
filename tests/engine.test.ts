import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkEpisode } from '../scripts/check-facts.ts';
import { lightSeconds, segmentCircleHit } from '../src/engine/play/geometry.ts';
import { sampleGrid } from '../src/engine/worlds/world.ts';
import { createJourney } from '../src/journey/store.ts';

test('segmentCircleHit: a path through a rock hits it on the near side', () => {
  const t = segmentCircleHit(0, 0, 10, 0, 5, 0, 1);
  assert.ok(t != null && Math.abs(t - 0.4) < 1e-9);
});

test('segmentCircleHit: a path that passes beside the rock misses', () => {
  assert.equal(segmentCircleHit(0, 0, 10, 0, 5, 1.5, 1), null);
});

test('segmentCircleHit: a path that stops short of the rock misses', () => {
  assert.equal(segmentCircleHit(0, 0, 3, 0, 5, 0, 1), null);
});

test('segmentCircleHit: starting inside the rock is a hit at once', () => {
  assert.equal(segmentCircleHit(5, 0, 10, 0, 5, 0, 1), 0);
});

test('lightSeconds: Mars on Pathfinder landing day was about 10.6 light-minutes away', () => {
  assert.ok(Math.abs(lightSeconds(191.5e6) / 60 - 10.65) < 0.05);
});

test('sampleGrid: interpolates between samples and clamps outside the grid', () => {
  // 2 x 2 grid, 10 m wide: north row 0 and 10, south row 20 and 30
  const grid = { n: 2, size: 10, data: new Float32Array([0, 10, 20, 30]) };
  assert.equal(sampleGrid(grid, -5, -5), 0);
  assert.equal(sampleGrid(grid, 5, 5), 30);
  assert.equal(sampleGrid(grid, 0, 0), 15);
  assert.equal(sampleGrid(grid, 999, 999), 30);
});

const GOOD = { id: 'landing', text: 'Landed in 1997.', source: 'https://science.nasa.gov/x', sourceName: 'NASA' };

test('check:facts passes a sourced fact that the script uses', () => {
  const report = checkEpisode([GOOD], "{ say: 'p1', fact: 'landing' }");
  assert.deepEqual(report, { errors: [], warnings: [] });
});

test('check:facts rejects an unknown fact id, including in winFact', () => {
  const report = checkEpisode([GOOD], "{ fact: 'landing' }, { winFact: 'made-up' }");
  assert.deepEqual(report.errors, ['episode.ts uses unknown fact "made-up"']);
});

test('check:facts rejects a fact without a source URL', () => {
  const report = checkEpisode([{ ...GOOD, source: 'a NASA page' }], "fact: 'landing'");
  assert.deepEqual(report.errors, ['fact "landing": source must be a URL']);
});

test('check:facts warns about TODO-VERIFY and unused facts', () => {
  const report = checkEpisode([{ ...GOOD, source: 'TODO-VERIFY' }], '');
  assert.equal(report.errors.length, 0);
  assert.deepEqual(report.warnings, ['fact "landing": still marked TODO-VERIFY', 'fact "landing" is not used by any line']);
});

test('journey: actions are ignored in the wrong phase', () => {
  const j = createJourney();
  j.choose('mars');
  j.explore('sojourner');
  j.finish('TAKEOFF');
  assert.equal(j.get().phase, 'HOME');
  assert.equal(j.get().destination, null);
});

test('journey: a double Start or a repeated finish cannot skip a cutscene', () => {
  const j = createJourney();
  j.start();
  j.start();
  assert.equal(j.get().phase, 'HOME_WALK');
  j.finish('HOME_WALK');
  j.finish('HOME_WALK');
  assert.equal(j.get().phase, 'TAKEOFF');
});

test('journey: the full path reaches the story, and coming back lands on the explorers', () => {
  const j = createJourney();
  j.start();
  j.finish('HOME_WALK');
  j.finish('TAKEOFF');
  j.choose('moon');
  j.finish('LANDING');
  j.hover('alsep');
  j.explore('alsep');
  j.finish('HOLOGRAM_LAUNCH');
  j.finish('BLACKOUT');
  assert.deepEqual(j.get(), { phase: 'STORY', destination: 'moon', hoveredId: 'alsep', selectedId: 'alsep' });
  j.resume();
  assert.equal(j.get().phase, 'EXPLORERS');
});

test('journey: reopening the screen (a language change) keeps the destination choice, a cutscene restarts at Home', () => {
  const j = createJourney();
  j.start();
  j.finish('HOME_WALK');
  j.finish('TAKEOFF');
  j.resume();
  assert.equal(j.get().phase, 'DESTINATION');
  const k = createJourney();
  k.start();
  k.resume();
  assert.equal(k.get().phase, 'HOME');
});
