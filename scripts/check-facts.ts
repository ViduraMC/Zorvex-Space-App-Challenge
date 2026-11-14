/**
 * npm run check:facts [-- --strict]
 * Guards the science. For every episode it checks that
 *   - each fact has an id, text, a source URL and a source name (ERROR),
 *   - each fact id used in an episode TypeScript module exists in facts.json (ERROR),
 *   - nothing is still marked TODO-VERIFY (WARNING; an ERROR with --strict, used before release),
 *   - facts that no line uses are listed (WARNING).
 * Runs on plain Node (type stripping), no dependencies.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface FactEntry {
  id?: string;
  text?: string;
  source?: string;
  sourceName?: string;
}

export interface Report {
  errors: string[];
  warnings: string[];
}

const TODO = 'TODO-VERIFY';
const FACT_REF = /\b(?:fact|factId2?|winFact):\s*'([^']+)'/g;

/** Pure check of one episode: its facts and the text of its episode.ts (plus any other text to scan). */
export function checkEpisode(facts: FactEntry[], script: string, otherText = ''): Report {
  const errors: string[] = [];
  const warnings: string[] = [];
  const ids = new Set<string>();

  for (const [i, fact] of facts.entries()) {
    const name = fact.id ? `fact "${fact.id}"` : `fact #${i + 1}`;
    if (!fact.id) errors.push(`${name}: missing id`);
    else if (ids.has(fact.id)) errors.push(`${name}: duplicate id`);
    else ids.add(fact.id);
    if (!fact.text?.trim()) errors.push(`${name}: missing text`);
    if (!fact.sourceName?.trim()) errors.push(`${name}: missing sourceName`);
    const flagged = [fact.text, fact.source, fact.sourceName].some((v) => v?.includes(TODO));
    if (flagged) warnings.push(`${name}: still marked ${TODO}`);
    else if (!/^https?:\/\/\S+$/.test(fact.source ?? '')) errors.push(`${name}: source must be a URL`);
  }

  const used = new Set<string>();
  for (const match of script.matchAll(FACT_REF)) used.add(match[1]);
  for (const id of used) if (!ids.has(id)) errors.push(`episode.ts uses unknown fact "${id}"`);
  for (const id of ids) if (!used.has(id)) warnings.push(`fact "${id}" is not used by any line`);
  if (otherText.includes(TODO)) warnings.push(`text files still contain ${TODO}`);
  return { errors, warnings };
}

function main(): void {
  const strict = process.argv.includes('--strict');
  const root = join(fileURLToPath(new URL('..', import.meta.url)), 'src', 'episodes');
  let errorCount = 0;
  let warningCount = 0;

  for (const id of readdirSync(root).filter((name) => !name.startsWith('_'))) {
    const dir = join(root, id);
    const scriptPath = join(dir, 'episode.ts');
    if (!existsSync(scriptPath)) continue;
    const factsPath = join(dir, 'facts.json');
    const facts = existsSync(factsPath) ? ((JSON.parse(readFileSync(factsPath, 'utf8')) as { facts?: FactEntry[] }).facts ?? []) : [];
    const i18nDir = join(dir, 'i18n');
    const i18n = existsSync(i18nDir)
      ? readdirSync(i18nDir).map((file) => readFileSync(join(i18nDir, file), 'utf8')).join('\n')
      : '';
    const scripts = readdirSync(dir, { recursive: true })
      .filter((file): file is string => typeof file === 'string')
      .filter((file) => file.endsWith('.ts'))
      .map((file) => readFileSync(join(dir, file), 'utf8'))
      .join('\n');
    const report = checkEpisode(facts, scripts, i18n);
    if (!existsSync(factsPath)) report.errors.push('facts.json is missing');

    console.log(`\n${id}: ${facts.length} facts`);
    for (const e of report.errors) console.log(`  ERROR    ${e}`);
    for (const w of report.warnings) console.log(`  WARNING  ${w}`);
    if (report.errors.length + report.warnings.length === 0) console.log('  ok');
    errorCount += report.errors.length;
    warningCount += report.warnings.length;
  }

  // the explorer roster: records whose dates and status are not yet checked against NASA
  const dataDir = join(root, '..', 'data');
  for (const file of existsSync(dataDir) ? readdirSync(dataDir).filter((name) => name.startsWith('explorers.') && name.endsWith('.json')) : []) {
    const records = JSON.parse(readFileSync(join(dataDir, file), 'utf8')) as { name: string; sources: { label: string }[] }[];
    const open = records.filter((r) => r.sources.some((src) => src.label.includes(TODO)));
    console.log(`\n${file}: ${records.length} explorers`);
    for (const r of open) console.log(`  WARNING  ${r.name}: still marked ${TODO}`);
    warningCount += open.length;
  }

  console.log(`\n${errorCount} error(s),${warningCount} warning(s)${strict ? ' (strict: warnings fail)' : ''}`);
  if (errorCount > 0 || (strict && warningCount > 0)) process.exit(1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
