import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

/** Every translation file must use only English keys and keep each {placeholder}. */
const read = (path: string): Record<string, string> => JSON.parse(readFileSync(path, 'utf8'));
const holes = (s: string): string => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

const dirs = [
  'src/i18n',
  ...readdirSync('src/episodes')
    .filter((id) => !id.startsWith('_'))
    .map((id) => join('src/episodes', id, 'i18n')),
];

for (const dir of dirs) {
  const en = read(join(dir, 'en.json'));
  for (const lang of ['si', 'ta']) {
    const path = join(dir, `${lang}.json`);
    if (!existsSync(path)) continue;
    test(`${path}: keys and placeholders match English`, () => {
      for (const [key, text] of Object.entries(read(path))) {
        if (key.startsWith('explorer.')) continue; // explorer summaries: English lives in the roster
        assert.ok(key in en, `unknown key "${key}"`);
        assert.equal(holes(text), holes(en[key]), `placeholders differ in "${key}"`);
      }
    });
  }
}
