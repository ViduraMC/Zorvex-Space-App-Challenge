/**
 * Episode registry. Episodes register themselves by existing: every src/episodes/<id>/episode.ts
 * is picked up automatically, so there is no central list to edit and nothing to merge-conflict on.
 * Folders starting with "_" are not shipped (the template; the dev-only playground).
 */
import type { EpisodeDef, Fact } from './engine/types';

const modules = import.meta.glob<EpisodeDef>('./episodes/*/episode.ts', { eager: true, import: 'default' });
const factFiles = import.meta.glob<{ facts: Fact[] }>('./episodes/*/facts.json', { eager: true, import: 'default' });

const isShipped = (path: string): boolean =>
  !path.includes('/_') || (import.meta.env.DEV && path.includes('/_playground/'));

export const episodes: EpisodeDef[] = Object.entries(modules)
  .filter(([path]) => isShipped(path))
  .map(([path, episode]) => {
    const folder = path.split('/')[2];
    if (episode.id !== folder) console.error(`[episodes] ${path}: id "${episode.id}" must equal its folder name`);
    return episode;
  })
  .sort((a, b) => a.order - b.order);

export const findEpisode = (id: string): EpisodeDef | undefined => episodes.find((e) => e.id === id);
/** The episode that tells an explorer's story (its own id, or one that covers several explorers). */
export const episodeFor = (explorerId: string): EpisodeDef | undefined =>
  episodes.find((e) => e.id === explorerId || e.covers?.includes(explorerId));
export const factsOf = (id: string): Fact[] => factFiles[`./episodes/${id}/facts.json`]?.facts ?? [];
