/**
 * The explorer roster (BUILD_GUIDE section 3). Data-driven: change the JSON files, not the code.
 * Every record carries its sources; "TODO-VERIFY" marks a record whose dates and status have not
 * yet been checked against NASA (npm run check:facts lists them).
 */
import mars from '../data/explorers.mars.json';
import moon from '../data/explorers.moon.json';
import type { Destination } from './store';

export const EXPLORER_TYPES = ['rover', 'lander', 'helicopter', 'descent-stage', 'instrument'] as const;
export type ExplorerType = (typeof EXPLORER_TYPES)[number];

export interface Explorer {
  id: string;
  name: string;
  type: ExplorerType;
  destination: Destination;
  slot: number;
  status: 'memorial' | 'active';
  years: { start: number; end: number | null };
  summary: string;
  sources: { label: string; url: string }[];
  /** Where it landed (east longitude), from the linked NASA page. Missing when not yet sourced. */
  site?: { lat: number; lon: number; note: string; source: string };
}

export const MAX_SLOTS = 9;

/** Validate one roster file; a bad record stops the app with a message that names the problem. */
export function parseRoster(raw: unknown, destination: Destination): Explorer[] {
  if (!Array.isArray(raw)) throw new Error(`explorers.${destination}.json must be a list`);
  const ids = new Set<string>();
  const list = raw.map((item: Partial<Explorer>, i) => {
    const where = `explorers.${destination}.json #${i + 1} (${item.id ?? 'no id'})`;
    const fail = (problem: string): never => {
      throw new Error(`${where}: ${problem}`);
    };
    if (!item.id || !/^[a-z][a-z0-9-]*$/.test(item.id)) fail('id must be lowercase letters, digits and dashes');
    else if (ids.has(item.id)) fail('duplicate id');
    else ids.add(item.id);
    if (!item.name) fail('missing name');
    if (!EXPLORER_TYPES.includes(item.type as ExplorerType)) fail(`type must be one of ${EXPLORER_TYPES.join(', ')}`);
    if (item.destination !== destination) fail(`destination must be "${destination}"`);
    if (item.status !== 'memorial' && item.status !== 'active') fail('status must be "memorial" or "active"');
    if (typeof item.years?.start !== 'number') fail('years.start must be a number');
    if (item.years?.end != null && typeof item.years.end !== 'number') fail('years.end must be a number or null');
    if (!item.summary) fail('missing summary');
    if (!Array.isArray(item.sources) || item.sources.length === 0) fail('needs at least one source');
    const site = item.site;
    if (site && (Math.abs(site.lat) > 90 || site.lon < -360 || site.lon > 360 || !site.source.startsWith('https://'))) {
      fail('site needs lat -90..90, lon -360..360 and a source URL');
    }
    return item as Explorer;
  });
  if (list.length < 1 || list.length > MAX_SLOTS) throw new Error(`explorers.${destination}.json needs 1 to ${MAX_SLOTS} explorers`);
  return list.sort((a, b) => a.slot - b.slot);
}

const ROSTERS: Record<Destination, Explorer[]> = {
  mars: parseRoster(mars, 'mars'),
  moon: parseRoster(moon, 'moon'),
};

export const explorersOf = (destination: Destination): Explorer[] => ROSTERS[destination];
export const findExplorer = (id: string): Explorer | undefined =>
  [...ROSTERS.mars, ...ROSTERS.moon].find((e) => e.id === id);
