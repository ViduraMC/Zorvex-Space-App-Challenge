# Resources: where every piece of data comes from

**Rule (from our mentors, 14 Nov 2026):** facts come only from the resources the challenge gives
us and the NASA pages named in our story briefs (`docs/stories/`). 3D models and images come
from NASA 3D Resources first; other free sources are allowed for visuals when NASA has none.

The same list is shown in the app on the **Sources & about** page (`src/data/sources.ts`), and
each explorer's hologram panel links its own sources.

## 1. Challenge resources

From the Resources tab of
<https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/?tab=resources>
(read 14 Nov 2026; the page only renders in a browser).

| Resource | Link | Where we use it |
|---|---|---|
| NSSDCA catalogue | <https://nssdc.gsfc.nasa.gov/> | Dates, sizes and status of the machines; most Sojourner facts. Pages used: Mars Pathfinder (`1996-068A`), Pathfinder Rover (`MESURPR`), Pathfinder project page, Pathfinder results and APXS results, Viking 2 Lander (`1975-083C`), Phoenix (`2007-034A`) |
| Apollo Lunar Modules | <https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C> | Moon explorer: Apollo 11 descent stage |
| Lunar Roving Vehicles | <https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C> | Moon explorer: Apollo 15 Lunar Roving Vehicle |
| ALSEP science packages | <https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-099C> | Moon explorer: Apollo 12 ALSEP |
| Surveyor landers | <https://science.nasa.gov/mission/surveyor-3/> | Moon explorer: Surveyor 3 |
| Sojourner rover | <https://science.nasa.gov/mission/mars-pathfinder/> | Mars explorer and the Sojourner story |
| Spirit and Opportunity | <https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/> | Mars explorers: Spirit and Opportunity; Sojourner's "who came after" line |
| Viking 1 and 2 landers | <https://science.nasa.gov/mission/viking-1/> | Mars explorers: Viking 1 and Viking 2 |
| Phoenix and InSight landers | <https://science.nasa.gov/mission/insight/> | Mars explorer: InSight |
| Dawn | <https://science.nasa.gov/mission/dawn/> | Not used yet (deep space) |
| NEAR Shoemaker | <https://science.nasa.gov/mission/near-shoemaker/> | Not used yet (deep space) |
| Pioneer 10 and 11 | <https://science.nasa.gov/mission/pioneer-10/> | Not used yet (deep space) |
| Ingenuity helicopter | <https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/> | Mars explorer: Ingenuity; Sojourner's "who came after" line |
| Kepler space telescope | <https://science.nasa.gov/mission/kepler/> | Not used yet (deep space) |

The explorer list follows these resources exactly: 8 on Mars, 4 on the Moon. Curiosity and
Perseverance were removed because the challenge resources do not cover them, so no explorer is
shown as "active" today.

## 2. NASA 3D Resources (<https://science.nasa.gov/3d-resources/>)

Downloaded 14 Nov 2026 and compressed with `gltf-transform optimize --compress meshopt`.
Raw downloads live in `models-src/` (git-ignored); the app uses `src/assets/models/`.

| Model or image | Page | Where we use it |
|---|---|---|
| Saturn V | <https://science.nasa.gov/3d-resources/saturn-v/> | The rocket on the first screen |
| Advanced Crew Escape Suit | <https://science.nasa.gov/3d-resources/advanced-crew-escape-suit/> | The young explorer in a spacesuit on the first screen |
| Mars Exploration Rover - Opportunity (MER-B) | <https://science.nasa.gov/3d-resources/mars-exploration-rover-opportunity-mer-b/> | Spirit and Opportunity (identical twins) |
| Viking Lander | <https://science.nasa.gov/3d-resources/viking-lander/> | Viking 1 and Viking 2 |
| InSight Cruise Lander (panels deployed) | <https://science.nasa.gov/3d-resources/insight-cruise-lander/> | InSight |
| Ingenuity Mars Helicopter | <https://science.nasa.gov/3d-resources/ingenuity-mars-helicopter/> | Ingenuity |
| Apollo Lunar Module | <https://science.nasa.gov/3d-resources/apollo-lunar-module/> | Apollo 11 descent stage (we show only the lower half of the model) |
| Mars (image texture) | <https://science.nasa.gov/3d-resources/mars/> | The Mars globe on the destination screen |

Not found on 3D Resources (we keep our own simple stand-in model): Sojourner, Phoenix, the
Lunar Roving Vehicle, ALSEP and Surveyor. Checked: the Earth images there are a relief map and a
photo, so we show no Earth globe.

## 2b. NASA pages from our story briefs

| Page | Link | Used for |
|---|---|---|
| Viking 2 | <https://science.nasa.gov/mission/viking-2/> | Viking story: launch, Utopia Planitia, endings |
| Viking Spacecraft and Science | <https://science.nasa.gov/mission/viking/spacecraft-and-science/> | Orbiter and lander hardware |
| Viking Project and Astrobiology | <https://science.nasa.gov/astrobiology/missions/viking-project/> | The search for life, soil results, endings |
| Viking: 50 Years on Mars | <https://science.nasa.gov/mission/viking/viking-50-years-on-mars/> | The first photo, the 19-minute signal |
| NSSDCA Viking 1 Lander (challenge catalogue) | <https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1975-075C> | The descent sequence |

## 3. Other images (visuals only, no facts)

| Image | Link | Where |
|---|---|---|
| Blue Marble, NASA's Scientific Visualization Studio | <https://svs.gsfc.nasa.gov/2915> | Earth globe in the Viking story |
| First image from the surface of Mars (Viking 1), NASA/JPL | <https://science.nasa.gov/mission/viking/viking-50-years-on-mars/> | Viking first-photo moment |
| Viking orbiter drawing and spacecraft photo, NASA | <https://science.nasa.gov/mars/resources/viking-mission-resources/> | Reference for our 3D orbiter |
| Viking 1 Lander panorama of Chryse Planitia (July 1976), NASA/JPL | <https://science.nasa.gov/mission/viking/viking-50-years-on-mars/> | 360-degree look-around in the Viking story |
| Viking 2 Lander colour view of Utopia Planitia, NASA/JPL | <https://science.nasa.gov/mission/viking-2/> | Viking 2's photo in the Viking story |

## 3c. Voices (AI-generated)

All recorded voices are made with the open Kokoro-82M text-to-speech model (Apache-2.0,
<https://huggingface.co/hexgrad/Kokoro-82M>), run on our own computer (`npm run voices`).
Cast: `src/episodes/*/voice/cast.json` and `src/journey/voice/cast.json`.

## 3d. Landing-site coordinates (hologram globe)

Every coordinate in `src/data/explorers.*.json` links the page it came from: NSSDCA
(Sojourner, Spirit, Opportunity, Phoenix's nominal site, Apollo 11, 12, 15) and the NASA mission
pages (Viking 1, Viking 2, InSight, Surveyor 3). Ingenuity has none yet.

## 3b. Other NASA data

| Data | Link | Why it is still here |
|---|---|---|
| CGI Moon Kit (LRO colour, LOLA elevation), NASA's Scientific Visualization Studio | <https://svs.gsfc.nasa.gov/4720> | The Moon globe. 3D Resources has no Moon colour map, only a printable model (12 MB STL). Decide: keep it, or use a plain grey Moon |

## 4. Not data (code and fonts)

three.js, postprocessing, camera-controls, GSAP, three.quarks, Astronomy Engine (computes where
Mars and the Moon are tonight), Google Fonts. Licences in `docs/CREDITS.md`.

## Removed on 14 Nov 2026 (not challenge resources)

USGS Viking Mars mosaic, HiRISE images and terrain (and the "Spot the machine" feature that
needed them), JPL news, NASA History and NASA Space Place pages, and the Curiosity and
Perseverance explorers. Sojourner facts that only those pages supported (top speed, 100 m driven,
the blue-sunset line, the rover's backup plan) were removed from the story.
