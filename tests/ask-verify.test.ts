import assert from 'node:assert/strict';
import { test } from 'node:test';
// @ts-expect-error plain JavaScript module from the server, no type declarations
import { numbersOk } from '../server/ask/verify.mjs';

test('ask server: an answer may only use numbers from the facts', () => {
  const facts = ['They covered 27.9 km and collected 77.31 kg of samples.', 'It sent 6,326 pictures.'];
  assert.equal(numbersOk('We drove 27.9 km!', facts), true);
  assert.equal(numbersOk('I sent 6326 pictures.', facts), true);
  assert.equal(numbersOk('We drove 27.99 km!', facts), false);
  assert.equal(numbersOk('I flew 72 times.', facts), false);
  assert.equal(numbersOk('No numbers here.', facts), true);
});
