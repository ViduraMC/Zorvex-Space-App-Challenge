/**
 * npm run ask:facts
 * Copies every shipped story's checked facts (and the machine's name) into server/ask/facts.json,
 * the only knowledge the AI answers from. Run it after facts change, before deploying the server.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const episodes = join(root, 'src', 'episodes');
const out: Record<string, { name: string; facts: { id: string; text: string; source: string }[] }> = {};

for (const id of readdirSync(episodes).filter((name) => !name.startsWith('_'))) {
  const factsPath = join(episodes, id, 'facts.json');
  if (!existsSync(factsPath)) continue;
  const facts = JSON.parse(readFileSync(factsPath, 'utf8')).facts as { id: string; text: string; source: string }[];
  const en = JSON.parse(readFileSync(join(episodes, id, 'i18n', 'en.json'), 'utf8')) as Record<string, string>;
  out[id] = {
    name: en['speaker.machine'] ?? en.machine ?? id,
    facts: facts.map(({ id: factId, text, source }) => ({ id: factId, text, source })),
  };
}

writeFileSync(join(root, 'server', 'ask', 'facts.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`server/ask/facts.json: ${Object.keys(out).length} stories`);
