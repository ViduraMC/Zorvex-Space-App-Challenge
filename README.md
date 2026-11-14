# ECHOES

**Humanity explored. Humanity departed. History remained.**

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

- **The journey:** Earth at night, first-person take-off, Moon or Mars (real NASA imagery on the
  globes), first-person landing, nine explorers on plinths, a hologram panel, Explore.
- **Stories you play:** each episode turns what the machine really did into mini-games.
  Real numbers are the game numbers (an 11-minute signal delay, 7 planned days against 83).
- **Every fact is sourced.** Each line a machine speaks links to a NASA page; the About page
  lists them all.
- **After a story:** a mission patch for your shelf, and "Look up tonight", which shows where Mars
  or the Moon is in your sky right now.
- English, Sinhala and Tamil (English is complete first). Works with keyboard and touch.

## Explorers and story owners

| Explorer | World | Story | Owner |
|---|---|---|---|
| Sojourner | Mars | Playable (pilot episode) | Vidura |
| Opportunity | Mars | Not started | Vidura |
| Apollo (descent stage, LRV, retroreflector) | Moon | Not started | Vidura |
| Ingenuity | Mars | Not started | [TBD] |
| Kepler | Deep space | Not started (no deep-space destination yet) | [TBD] |
| Spirit, Curiosity, Perseverance, Viking 1, Phoenix, InSight | Mars | Placeholder page | [TBD] |

## For the team

- `CLAUDE.md`: the rules every teammate and every AI session follows
- `CONTRIBUTING.md`: how to add an episode in 6 steps, how to add a mini-game
- `docs/BUILD_GUIDE.md`: the journey specification
- `docs/FUN_CHECKLIST.md`, `docs/FACTS_POLICY.md`, `docs/RESOURCES.md`, `docs/CREDITS.md`,
  `docs/AI_USAGE.md`, `docs/SUBMISSION.md`, `docs/PROGRESS.md`

## Credits

Built with three.js, postprocessing, camera-controls, GSAP, three.quarks and Astronomy Engine.
Planet imagery: NASA/JPL/USGS and NASA's Scientific Visualization Studio. Mission facts: NASA
NSSDCA, NASA Science, NASA JPL, HiRISE. Full list in `docs/CREDITS.md`.
NASA does not endorse this project. MIT licence.
