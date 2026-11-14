# The Abandoned Explorers

**Abandoned but not Forgotten.**

An interactive 3D journey for young explorers (ages 8 to 14) about the machines NASA left on the
Moon and Mars. Board a rocket, choose a world, meet its explorers, and **play** each machine's
true mission while it tells its own story.

Team Zorvex · NASA Space Apps Challenge 2026 · Kandy, Sri Lanka ·
Challenge: [Abandoned but not Forgotten](https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/)

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

Node 22.18 or newer. `npm run build` makes the static site in `dist/`.

## What is in it

- **The journey:** Earth at night with NASA's own Saturn V, first-person take-off, Moon or Mars,
  first-person landing, the explorers on plinths (NASA 3D models where NASA publishes one),
  a hologram panel with each explorer's sources, Explore.
- **Stories you play:** each episode turns what the machine really did into mini-games.
  Real numbers are the game numbers (a 10-minute signal delay, 7 planned days against 83).
- **Every fact is sourced.** Each line a machine speaks links to a NASA page; the About page
  lists them all.
- **After a story:** a mission patch for your shelf, and "Look up tonight", which shows where Mars
  or the Moon is in your sky right now.
- English, Sinhala and Tamil interface; episode translations vary (Apollo 11 story text is
  currently English-only). Works with keyboard and touch.

## Explorers and story owners

| Explorer | World | Story | Owner |
|---|---|---|---|
| Sojourner | Mars | Playable (pilot episode) | Vidura |
| Viking 1 and Viking 2 | Mars | Playable (11 pages, 3 worlds) | Vidura |
| InSight | Mars | Playable (5 pages: place SEIS, catch marsquakes, the mole) | Bimsara, Yasassri; fixed by Vidura |
| Apollo 11 descent stage | Moon | Playable (EASEP, four acts) | Haritha; fixed by Vidura |
| Apollo 12 ALSEP | Moon | Playable (9 pages: launch, instruments, moonquake, the long watch) | Kaushal; fixed by Vidura |
| Pioneer 10 and 11 | Deep space (from the shelf) | Playable (9 pages) | Bimsara, Yasassri; fixed by Vidura |
| Spirit, Opportunity, Phoenix, Ingenuity | Mars | Placeholder page | [TBD] |
| Apollo 15 LRV, Surveyor 3 | Moon | Placeholder page | [TBD] |

## For the team

- `CLAUDE.md`: the rules every teammate and every AI session follows
- `CONTRIBUTING.md`: how to add an episode in 6 steps, how to add a mini-game
- `docs/BUILD_GUIDE.md`: the journey specification
- `docs/FUN_CHECKLIST.md`, `docs/FACTS_POLICY.md`, `docs/RESOURCES.md`, `docs/CREDITS.md`,
  `docs/AI_USAGE.md`, `docs/SUBMISSION.md`, `docs/PROGRESS.md`

### Apollo 11 story testing

The Apollo 11 episode is launched from its Moon explorer. For local act-by-act testing, use
`?act=1`, `?act=2`, `?act=3`, or `?act=4` before the episode hash (for example,
`http://localhost:5173/?act=3#ep-apollo-11-descent-stage`). Omit the query parameter to play
the selected act and everything after it. Edit part and scene values in
`src/episodes/apollo-11-descent-stage/storyData.ts`, timeline events in `timelineData.ts`,
verified facts in `facts.json`, and narration/UI text in `i18n/en.json`.

## Data sources

The challenge resources and NASA 3D Resources, plus the two owner-approved Apollo 11 NASA pages
for this episode. The full list, and where each item is used, is in `docs/RESOURCES.md` and on
the in-app **Sources & about** page.

## Credits

Built with three.js, postprocessing, camera-controls, GSAP, three.quarks and Astronomy Engine.
3D models and the Mars image: NASA 3D Resources. Mission facts: NASA NSSDCA and NASA Science
(the challenge resources). Moon map: NASA's Scientific Visualization Studio (flagged). Full list in `docs/CREDITS.md`.
NASA does not endorse this project. MIT licence.
