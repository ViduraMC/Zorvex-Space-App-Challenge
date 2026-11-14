# DECISIONS.md — alsep-apollo-12 episode

Every assumption made where the brief was silent or required creative judgment.
See ALSEP.md section 14 for known source discrepancies.

## Camera

| Decision | Rationale |
|---|---|
| Camera eye height: 0.8 m above ground | ALSEP central station mass ~25 kg, estimated 0.8 m to antenna mast tip [CL]. The brief specifies 0.8 m. |
| Camera position fixed at world origin (0, 0, 0) | ALSEP is stationary; the camera IS the station's viewpoint [CL]. |
| Free-look disabled during eyelid animations | Per brief section 5. The director handles this. |
| Earth placed at approximately (-420, 520, -900) in three.js units | The moon.ts world already positions Earth there; we inherit it [CL]. |

## Scene geometry

| Decision | Rationale |
|---|---|
| All geometry is procedural (no external models) | NASA 3D Resources does not publish a standalone ALSEP model; Apollo Lunar Module GLB exists but ALSEP is stationary so a custom scene is cleaner. |
| Intrepid placed at (110, 0, -70) | Approx 130 m ENE matches the NSSDCA page "about 130 m" [LM]. |
| Surveyor 3 placed at (165, -4, 95) | Inside a shallow crater ~180 m SE of Intrepid [LM][SURV]. y=-4 represents crater bowl. |
| Footprints: 80 flat boxes fanning from Intrepid toward ALSEP and Surveyor | Total EVA traverse 1.35 km; path inferred from documented destinations [LM][CL]. |
| Ribbon cables drawn as tube segments from each instrument to origin | Documented in NSSDCA as "flat ribbon cables" [LM]; exact routing is [CL]. |
| Six instrument colours are unique hues (not based on real hardware) | For child-readable visual differentiation [CL]. |

## Timing

| Decision | Rationale |
|---|---|
| Liftoff animation duration: 4 s | Compressed; real ascent takes minutes [CL]. |
| Moonquake shake: 18 micro-taps, ~1.26 s total | Enough to feel visceral without motion sickness [CL]. |
| Day/night cycle: ~1 day per 2.5 real seconds (dt * 0.4) | Fits within Act 4 pacing; 96 cycles would take ~4 minutes at this rate [CL]. |
| counterRace plan=7, actual=2922 | 7 planned EVA days vs ~8 years = 2922 days (8 × 365.25) [LM][CL calculation]. |

## Audio

| Decision | Rationale |
|---|---|
| No exterior sound for liftoff or crash | Per brief: no sound in vacuum. Only internal hum, clicks, seismic rumble [CL]. |
| Audio handled by the existing engine AudioEngine | The episode does not add new audio files; engine provides beep/thud/win. |

## Coordinates

| Decision | Rationale |
|---|---|
| Longitude normalised: 338.80° E → 21.20° W | As required by brief section 14 and storyData longitude format. |
| Landing site (Intrepid): 3.0128° S, 23.4219° W | From NSSDCA [LM]. |
| ALSEP site: 3.0094° S, 23.4246° W | From NSSDCA [LM]. |
| Impact site (Intrepid ascent): 3.94° S, 21.20° W | 338.80° E normalised [LM]. |

## NASA 3D Resources

| Decision | Rationale |
|---|---|
| No GLB model set on `machine:` | ALSEP is stationary; scene.ts builds it procedurally. The Apollo LM GLB (already in src/assets/models/) could be used for the descent stage in a future upgrade. |
| Saturn V / Yankee Clipper / Surveyor shown as procedural geometry | No standalone ALSEP-era versions published on science.nasa.gov/3d-resources at time of build. |

## Style

| Decision | Rationale |
|---|---|
| `style: 'cinematic'` | The brief calls for "quiet, warm, enduring" tone — not comic panels. |
| Patch: deep navy (#1a3a6b) with glyph 'A12' | Avoids NASA insignia; evokes night sky; 'A12' is unambiguous [CL]. |

## Missing / TODO

- [ ] Add actual Web Speech API TTS or voice clips in `voice/en/` for each narration key.
- [ ] Add a `?act=N` and `?debug` query-param handler to the director (engine-level, not episode-level).
- [ ] The timeline mini-game in Act 3 uses `counterRace` as the closest available kit game. A purpose-built interactive timeline bar (as described in ALSEP.md §8) would be ideal as a future custom game.
- [ ] Liftoff dust particles: depends on the engine's `fx.burst` supporting ballistic trajectories. Currently called but may fall back gracefully.
