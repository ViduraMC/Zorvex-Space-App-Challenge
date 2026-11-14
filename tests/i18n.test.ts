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

test('anatomy: every part has a sourced fact and its text in English, Sinhala and Tamil', () => {
  const data = JSON.parse(readFileSync('src/data/anatomy.json', 'utf8')) as Record<string, { parts: { id: string; at: number[]; fact: { text: string; source: string } }[] }>;
  const langs = ['en', 'si', 'ta'].map((l) => read(join('src/i18n', `${l}.json`)));
  for (const [model, { parts }] of Object.entries(data)) {
    for (const part of parts) {
      assert.ok(part.fact.text.length > 20 && part.fact.source.startsWith('https://'), `${model}.${part.id}: needs a fact and source`);
      assert.equal(part.at.length, 3, `${model}.${part.id}: at needs x, y, z`);
      for (const field of ['name', 'job', 'science']) {
        for (const dict of langs) assert.ok(`parts.${model}.${part.id}.${field}` in dict, `missing parts.${model}.${part.id}.${field}`);
      }
    }
  }
});

test('ask: a question finds the fact that answers it', async () => {
  const { bestFact } = await import('../src/features/ask-match.ts');
  const facts = [
    { id: 'a', text: 'The lander touched down on 20 July 1976 at Chryse Planitia.', source: 'x', sourceName: 'x' },
    { id: 'b', text: 'Two RTGs with plutonium gave the lander electrical power.', source: 'x', sourceName: 'x' },
  ];
  assert.equal(bestFact('Where did your power come from?', facts)?.id, 'b');
  assert.equal(bestFact('When did you touch down?', facts)?.id, 'a');
  assert.equal(bestFact('Do you like pizza?', facts), null);
});
