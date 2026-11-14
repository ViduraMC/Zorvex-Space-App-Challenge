# Resources

Every link the challenge gives us, plus the other sources we use. Read on 14 Nov 2026.

## Official challenge resources

From the Resources tab of
<https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/?tab=resources>.
The page only renders in a browser (it needs JavaScript).

| Resource | Link | What we use it for |
|---|---|---|
| NSSDCA catalogue | <https://nssdc.gsfc.nasa.gov/> | The reference for every machine: dates, sizes, where it rests, its status |
| Apollo Lunar Modules | <https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C> | Apollo 11 descent stage (Moon roster, slot 4) |
| Lunar Roving Vehicles | <https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C> | The three Moon rovers (Moon roster, slots 1 to 3) |
| ALSEP science packages | <https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-099C> | ALSEP and the retroreflector (Moon roster, slots 5 and 6) |
| Surveyor landers | <https://science.nasa.gov/mission/surveyor-3/> | Candidate for the free Moon slots 7 to 9 |
| Sojourner rover | <https://science.nasa.gov/mission/mars-pathfinder/> | **Used.** Sojourner episode facts |
| Spirit and Opportunity | <https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/> | Mars roster, slots 2 and 3 |
| Viking 1 and 2 landers | <https://science.nasa.gov/mission/viking-1/> | Mars roster, slot 7 |
| Phoenix and InSight landers | <https://science.nasa.gov/mission/insight/> | Mars roster, slots 8 and 9 |
| Dawn | <https://science.nasa.gov/mission/dawn/> | Not used yet (deep space) |
| NEAR Shoemaker | <https://science.nasa.gov/mission/near-shoemaker/> | Not used yet (deep space) |
| Pioneer 10 and 11 | <https://science.nasa.gov/mission/pioneer-10/> | Not used yet (deep space) |
| Ingenuity helicopter | <https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/> | Mars roster, slot 6 |
| Kepler space telescope | <https://science.nasa.gov/mission/kepler/> | Not used yet (deep space) |

Dawn, NEAR Shoemaker, Pioneer and Kepler are not on the Moon or Mars, so the destination screen
has no place for them yet. Adding a third "Deep space" destination would bring them in.

## NASA data in the product now

| Data | Link | Where |
|---|---|---|
| Mars global colour mosaic (Viking MDIM 2.1), NASA/JPL/USGS | File: <https://astrogeology.usgs.gov/ckan/dataset/7131d503-cdc9-45a5-8f83-5126c0fd397e/resource/6afad901-1caa-48a7-8b62-3911da0004c2/download/mars_viking_mdim21_clrmosaic_global_1024.jpg> (TODO-VERIFY: the catalogue page and exact credit line) | The Mars globe (`src/assets/planets/mars.jpg`) |
| CGI Moon Kit: LRO colour and LOLA elevation, NASA's Scientific Visualization Studio | <https://svs.gsfc.nasa.gov/4720> | The Moon globe and its relief (`moon.jpg`, `moon_bump.jpg`) |
| NSSDCA, NASA Science, NASA JPL and NASA History pages | see `src/episodes/sojourner/facts.json` | Every fact in the Sojourner episode (22 facts, each with its source) |

## NASA data ready to add next

| Data | Link | Note |
|---|---|---|
| HiRISE terrain model of the Pathfinder site (1 m per pixel) | <https://www.uahirise.org/dtm/PSP_002391_1995> | 376 MB. The engine already accepts a real height grid (`site` in `worlds/mars.ts`). Byte-range download of only the rows we need works at about 50 KB/s; the label says 6579 x 14277 samples, 32-bit floats, 26316 bytes per row. The lander's pixel still has to be located (it is near line 3060, sample 4820, give or take a few hundred metres). |
| HiRISE photo of the Pathfinder site, 21 Dec 2006 | <https://www.uahirise.org/PSP_001890_1995> | For "Spot the machine". The feature is built; it needs the cropped photo and the lander's position on it. |
| NASA 3D Resources (official models) | <https://science.nasa.gov/3d-resources/> | Real models for the explorers; there is no official Sojourner model. |
| NASA Image and Video Library | <https://images.nasa.gov/> | Photos for the story pages |
| LROC (Moon orbital photos of the Apollo sites) | <https://lroc.asu.edu/> | "Spot the machine" for the Moon |

## Space Apps rules

- Submission guide: <https://www.spaceappschallenge.org/resources/project-submission-guide/>
- Judging and awards: <https://www.spaceappschallenge.org/resources/judging-awards-guide>
- Participant FAQs: <https://www.spaceappschallenge.org/resources/participant-faqs/>

These three pages were not re-read for 2026 yet (see `docs/SUBMISSION.md`).
