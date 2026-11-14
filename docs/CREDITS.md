# Credits

## NASA data and imagery

| Asset | File | Credit | Licence |
|---|---|---|---|
| Mars global colour mosaic (Viking MDIM 2.1), 1024 px | `src/assets/planets/mars.jpg` | NASA/JPL/USGS | Public domain (TODO-VERIFY the exact credit line on the USGS catalogue page) |
| Moon colour map, CGI Moon Kit (LRO camera), 1k | `src/assets/planets/moon.jpg` | NASA's Scientific Visualization Studio | Public domain |
| Moon elevation, CGI Moon Kit (LOLA), 8-bit | `src/assets/planets/moon_bump.jpg` | NASA's Scientific Visualization Studio | Public domain |
| Mission facts | `src/episodes/*/facts.json` | NASA NSSDCA, NASA Science, NASA JPL, NASA History, HiRISE (NASA/JPL-Caltech/UArizona) | Each fact links its source |

NASA does not endorse this project.

## Libraries

Versions and licences checked on npm on 14 Nov 2026.

| Package | Version | Licence | Used for |
|---|---|---|---|
| three | 0.187.0 | MIT | 3D rendering |
| postprocessing (pmndrs) | 6.39.6 | Zlib | Bloom, film grain, vignette, tone mapping, SMAA. Supports three 0.168 to 0.187 |
| camera-controls | 3.1.2 | MIT | Camera moves and orbit in episodes |
| gsap | 3.15.1 | GSAP standard "no charge" licence | UI animation, cutscene timelines, SplitText |
| three.quarks | 0.17.1 | MIT | Particles (dust, sparks). Needs three 0.182 or newer |
| astronomy-engine | 2.1.19 | MIT | "Look up tonight" and the Earth to Mars distance |
| vite 8.3.8, typescript 6.0.3, eslint 10.15.0, typescript-eslint 8.72.2 | | MIT / Apache-2.0 | Build and checks (dev only) |
| @gltf-transform/cli | 4.5.1 | MIT | Model compression, fetched on demand by `npm run optimize:models` |

## Fonts (Google Fonts, SIL Open Font Licence)

Bodoni Moda (the free stand-in for Didot; Apple devices use their built-in Didot), Bangers,
Comic Neue, Noto Sans Sinhala, Noto Sans Tamil.

Linotype Didot itself is a commercial font. To use it on every device we need a web-font licence;
then it is a one-line change in `src/styles/tokens.css`.

## Made by us

All 3D objects (rocket, child, rovers, landers, terrain, rocks) are built in code.
All sounds are synthesised in the browser. Mission patches are our own design.
