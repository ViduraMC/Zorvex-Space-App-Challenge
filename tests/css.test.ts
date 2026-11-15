import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

// In dev each stylesheet is parsed alone, so an unclosed block only hides itself. The production
// build joins them into one file, where one missing "}" pulled every later rule into a
// reduced-motion media query and left the live site unstyled.
test('every stylesheet closes all its blocks', () => {
  const dir = new URL('../src/styles/', import.meta.url);
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.css'))) {
    const css = readFileSync(new URL(file, dir), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    let depth = 0;
    for (const c of css) {
      if (c === '{') depth++;
      if (c === '}') depth--;
      assert.ok(depth >= 0, `${file}: a "}" with no block to close`);
    }
    assert.equal(depth, 0, `${file}: ${depth} block(s) never closed`);
  }
});
