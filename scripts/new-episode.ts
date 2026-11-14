/**
 * npm run new:episode <id>
 * Copies src/episodes/_template to src/episodes/<id> and fills in the id and title.
 * The new episode registers itself: it appears in the hub with no other file to edit.
 */
import { cpSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const id = process.argv[2];
if (!id || !/^[a-z][a-z0-9-]*$/.test(id)) {
  console.error('Usage: npm run new:episode <id>   (lowercase letters, digits and dashes, e.g. "ingenuity")');
  process.exit(1);
}

const episodes = join(fileURLToPath(new URL('..', import.meta.url)), 'src', 'episodes');
const target = join(episodes, id);
if (existsSync(target)) {
  console.error(`src/episodes/${id} already exists. Nothing was changed.`);
  process.exit(1);
}

const title = id
  .split('-')
  .map((word) => word[0].toUpperCase() + word.slice(1))
  .join(' ');

cpSync(join(episodes, '_template'), target, { recursive: true });

function fill(dir: string): void {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) fill(path);
    else if (/\.(ts|json)$/.test(name)) {
      writeFileSync(path, readFileSync(path, 'utf8').replaceAll('__ID__', id).replaceAll('__TITLE__', title));
    }
  }
}
fill(target);

console.log(`Created src/episodes/${id}`);
console.log(`  1. npm run dev, then open http://localhost:5173/#ep-${id}`);
console.log('  2. Write your facts into facts.json (each with a NASA source URL)');
console.log('  3. Write the story in episode.ts and the words in i18n/en.json');
console.log('  4. npm run check:facts, then run docs/FUN_CHECKLIST.md');
