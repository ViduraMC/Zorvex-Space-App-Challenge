# Credits

Where each piece of data is used: `docs/RESOURCES.md`.

## NASA data

| Asset | Files | Credit |
|---|---|---|
| Mission facts and explorer dates | `src/episodes/*/facts.json`, `src/data/explorers.*.json` | NASA NSSDCA and NASA Science mission pages (the challenge resources) |
| Saturn V, Advanced Crew Escape Suit, Mars Exploration Rover (Opportunity), Viking Lander, InSight, Ingenuity, Apollo Lunar Module | `src/assets/models/*.glb` | NASA 3D Resources, science.nasa.gov/3d-resources |
| Mars image texture | `src/assets/planets/mars.jpg` | NASA 3D Resources |
| Moon colour map and elevation (flagged in RESOURCES.md) | `src/assets/planets/moon.jpg`, `moon_bump.jpg` | NASA's Scientific Visualization Studio, CGI Moon Kit |

NASA does not endorse this project. No NASA logos or insignia are used in our own artwork;
the NASA models are shown as published.

## Libraries

Versions and licences checked on npm on 14 Nov 2026.

| Package | Version | Licence | Used for |
|---|---|---|---|
| three | 0.187.0 | MIT | 3D rendering |
| postprocessing (pmndrs) | 6.39.6 | Zlib | Bloom, film grain, vignette, tone mapping, SMAA |
| camera-controls | 3.1.2 | MIT | Camera moves in episodes |
| gsap | 3.15.1 | GSAP standard "no charge" licence | Animation and cutscene timelines |
| three.quarks | 0.17.1 | MIT | Particles (dust, sparks) |
| astronomy-engine | 2.1.19 | MIT | "Look up tonight" |
| vite, typescript, eslint, typescript-eslint | | MIT / Apache-2.0 | Build and checks (dev only) |
| @gltf-transform/cli | 4.5.1 | MIT | Model compression (run on demand, not installed) |

## Fonts (Google Fonts, SIL Open Font Licence)

Bodoni Moda (free stand-in for Didot; Apple devices use their built-in Didot), Bangers,
Comic Neue, Noto Sans Sinhala, Noto Sans Tamil.

## Made by us

Stand-in models for machines NASA 3D Resources does not have, the terrain, rocks, sky and sounds
(synthesised in the browser), and the mission patches.
