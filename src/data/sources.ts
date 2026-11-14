/**
 * Every place our data comes from, in one list. The About page shows it and docs/RESOURCES.md
 * mirrors it. Rule (from our mentors): use the challenge's own resources, plus NASA's official
 * 3D Resources site for models and planet images. Facts may also come from NASA pages named in a
 * team story brief. Images and models may come from other free sources when NASA has none.
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

/** NASA pages named in the team's story briefs (docs/stories/). Facts may come from these too. */
export const STORY_SOURCES: Source[] = [
  { label: 'NASA Science: Viking 2', url: 'https://science.nasa.gov/mission/viking-2/', usedFor: 'Viking story: launch, landing, Utopia Planitia, endings' },
  { label: 'NASA Science: Viking Spacecraft and Science', url: 'https://science.nasa.gov/mission/viking/spacecraft-and-science/', usedFor: 'Viking story: orbiter and lander hardware, instruments' },
  { label: 'NASA Science: Viking Project and Astrobiology', url: 'https://science.nasa.gov/astrobiology/missions/viking-project/', usedFor: 'Viking story: the search for life, soil results, endings' },
  { label: 'NASA Science: Viking, 50 Years on Mars', url: 'https://science.nasa.gov/mission/viking/viking-50-years-on-mars/', usedFor: 'Viking story: the first photo, the 19-minute signal' },
  { label: 'NASA NSSDCA: Viking 1 Lander', url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1975-075C', usedFor: 'Viking story: the descent sequence (parachute at 6 km)' },
];

/** Images and maps from other NASA sites (allowed for visuals; no facts are taken from them). */
export const OTHER_SOURCES: Source[] = [
  {
    label: "Blue Marble: Land Surface, Ocean Color and Sea Ice, NASA's Scientific Visualization Studio",
    url: 'https://svs.gsfc.nasa.gov/2915',
    usedFor: 'The Earth globe in the Viking story and below the rocket after take-off',
  },
  {
    label: 'First image from the surface of Mars (Viking 1, 20 July 1976), NASA/JPL',
    url: 'https://science.nasa.gov/mission/viking/viking-50-years-on-mars/',
    usedFor: 'The first-photo moment in the Viking story',
  },
  {
    label: 'Viking 1 Lander panorama of Chryse Planitia (July 1976), NASA/JPL',
    url: 'https://science.nasa.gov/mission/viking/viking-50-years-on-mars/',
    usedFor: 'The 360-degree look-around in the Viking story',
  },
  {
    label: 'Viking 2 Lander colour view of Utopia Planitia, NASA/JPL',
    url: 'https://science.nasa.gov/mission/viking-2/',
    usedFor: "Viking 2's photo in the Viking story",
  },
  {
    label: 'Kokoro-82M text-to-speech model (Apache-2.0), run locally through the HyperFrames CLI',
    url: 'https://huggingface.co/hexgrad/Kokoro-82M',
    usedFor: 'All recorded voices (AI-generated speech)',
  },
  {
    label: 'Viking orbiter line drawing and Viking spacecraft photo, NASA',
    url: 'https://science.nasa.gov/mars/resources/viking-mission-resources/',
    usedFor: 'Reference for our 3D Viking orbiter (NASA 3D Resources has no orbiter model)',
  },
  {
    label: "CGI Moon Kit (LRO colour and LOLA elevation), NASA's Scientific Visualization Studio",
    url: 'https://svs.gsfc.nasa.gov/4720',
    usedFor: 'The Moon globe (NASA 3D Resources has no Moon colour map)',
  },
];
