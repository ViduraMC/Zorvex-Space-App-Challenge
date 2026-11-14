/**
 * Every place our data comes from, in one list. The About page shows it and docs/RESOURCES.md
 * mirrors it. Rule (from our mentors): use the challenge's own resources, plus NASA's official
 * 3D Resources site for models and planet images. Anything else must be listed here and flagged.
 */
import { NASA_MODELS } from '../journey/nasaModels';

export interface Source {
  label: string;
  url: string;
  /** Where in the product it is used. */
  usedFor: string;
}

export const CHALLENGE_PAGE =
  'https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/?tab=resources';

/** From the challenge's Resources tab, in its order. */
export const CHALLENGE_RESOURCES: Source[] = [
  { label: 'NASA Space Science Data Coordinated Archive (NSSDCA)', url: 'https://nssdc.gsfc.nasa.gov/', usedFor: 'Dates, sizes and status of every machine; most Sojourner facts' },
  { label: 'Apollo Lunar Modules', url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C', usedFor: 'Moon explorer: Apollo 11 descent stage' },
  { label: 'Lunar Roving Vehicles (LRVs)', url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C', usedFor: 'Moon explorer: Apollo 15 Lunar Roving Vehicle' },
  { label: 'ALSEP Scientific Packages', url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-099C', usedFor: 'Moon explorer: Apollo 12 ALSEP' },
  { label: 'Surveyor Landers', url: 'https://science.nasa.gov/mission/surveyor-3/', usedFor: 'Moon explorer: Surveyor 3' },
  { label: 'Sojourner Rover', url: 'https://science.nasa.gov/mission/mars-pathfinder/', usedFor: 'Mars explorer and the Sojourner story' },
  { label: 'Spirit & Opportunity', url: 'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/', usedFor: 'Mars explorers: Spirit and Opportunity' },
  { label: 'Viking 1 & 2 Landers', url: 'https://science.nasa.gov/mission/viking-1/', usedFor: 'Mars explorers: Viking 1 and Viking 2' },
  { label: 'Phoenix & InSight Landers', url: 'https://science.nasa.gov/mission/insight/', usedFor: 'Mars explorers: InSight (Phoenix dates from the NSSDCA catalogue)' },
  { label: 'Dawn Spacecraft', url: 'https://science.nasa.gov/mission/dawn/', usedFor: 'Not used yet (deep space)' },
  { label: 'NEAR Shoemaker', url: 'https://science.nasa.gov/mission/near-shoemaker/', usedFor: 'Not used yet (deep space)' },
  { label: 'Pioneer 10 & 11', url: 'https://science.nasa.gov/mission/pioneer-10/', usedFor: 'Not used yet (deep space)' },
  { label: 'Ingenuity Helicopter', url: 'https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/', usedFor: 'Mars explorer: Ingenuity' },
  { label: 'Kepler Space Telescope', url: 'https://science.nasa.gov/mission/kepler/', usedFor: 'Not used yet (deep space)' },
];

/** NASA 3D Resources (https://science.nasa.gov/3d-resources/): models and planet images. */
export const NASA_3D_RESOURCES: Source[] = [
  ...Object.values(NASA_MODELS).map((m) => ({ label: `${m.title} (3D model)`, url: m.page, usedFor: modelUse(m.title) })),
  { label: 'Mars (image texture)', url: 'https://science.nasa.gov/3d-resources/mars/', usedFor: 'The Mars globe on the destination screen' },
];

function modelUse(title: string): string {
  if (title === 'Saturn V') return 'The rocket on the first screen';
  if (title === 'Advanced Crew Escape Suit') return 'The young explorer in a spacesuit on the first screen';
  if (title.startsWith('Mars Exploration Rover')) return 'Spirit and Opportunity (identical twins) on Mars';
  if (title.startsWith('Viking')) return 'Viking 1 and Viking 2 on Mars';
  if (title.startsWith('InSight')) return 'InSight on Mars';
  if (title.startsWith('Ingenuity')) return 'Ingenuity on Mars';
  return 'Apollo 11 descent stage on the Moon (lower half of the model only)';
}

/** Additional NASA sources approved for the Apollo 11 story, plus the Moon globe source to replace. */
export const OTHER_SOURCES: Source[] = [
  {
    label: "CGI Moon Kit (LRO colour and LOLA elevation), NASA's Scientific Visualization Studio",
    url: 'https://svs.gsfc.nasa.gov/4720',
    usedFor: 'The Moon globe. NASA 3D Resources has no Moon colour map, only a printable model',
  },
  {
    label: 'Apollo 11 Command and Service Module (NSSDCA)',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059A',
    usedFor: 'Apollo 11 story: Columbia, launch, flight timeline, and return to Earth',
  },
  {
    label: 'Apollo 11: 25th Anniversary (NASA)',
    url: 'https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo11.html',
    usedFor: 'Apollo 11 story: surface photographs, flag, samples, and timeline quotes',
  },
];
