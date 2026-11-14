# Progress

Updated: Saturday 14 Nov 2026, about 16:00 (Asia/Colombo).

## Now

- Code is on GitHub (private): https://github.com/ViduraMC/Zorvex-Space-App-Challenge. Not deployed yet.
- Data now comes only from the challenge resources plus NASA 3D Resources (mentors' rule). Sources page and hologram panel list every source.
- First screen uses NASA's Saturn V and crew escape suit models; explorers use NASA models where they exist.
- Opening journey works end to end: Home, take-off, destination, landing, explorers, hologram,
  launch, story. Back from a story returns to the explorers without replaying cutscenes.
- Sojourner episode plays end to end with four mini-games and awards its patch.
- InSight episode implemented in `src/episodes/insight/`: 5 scenes, official NASA 3D model, deployable SEIS dome & HP3 Mole, Marsquake timingTap mini-game, 9 verified facts. Direct integration with Mars explorer roster.
- Pioneer 10 & 11 episode implemented in `src/episodes/pioneer/`: 9 chapters, 33 verified facts, Three.js 3D spacecraft, Jupiter & Saturn with rings, and mini-games (`counterRace`, `balance`, `findHidden`, `resourceManage`). Passes lint, typecheck, tests, check:facts, and build.

## Next

1. Vidura: read the changes in `CLAUDE.md` ("Decisions already made"), then say how the stories should go.
2. Create the GitHub repository, push, connect Vercel (public URL and pull-request previews).
3. Decide on the Moon globe image (only non-challenge, non-3D-Resources data left; see docs/RESOURCES.md section 3).
4. Stories for each explorer (Vidura is sending them).
5. Route globe and filters in the hologram panel (build guide step 12): needs real traverse data.
6. Real explorer models from NASA 3D Resources instead of the stand-ins (build guide step 15).
7. Sinhala and Tamil episode text; our own voice recordings.
8. Phase 2: "Ask the machine" and "Postcard" (serverless, fact-locked).

## Blockers

- No Vercel login yet, so no deploy and no preview links. The repository must be made public before submission.
- Frame rate could not be measured here: the test browser window was throttled. One frame of the
  Sojourner scene costs about 12 ms to render on this laptop's Intel graphics (measured), which
  leaves room for 60 fps, but that is a calculation, not a measurement. Not tested on a phone.

## Backlog (one line each)

- Sojourner scene makes about 320 draw calls; merge the wheel cleats to cut it down.
- Mini-game HUD and the end card still use comic colours inside the cinematic style.
- The explorers' layout is chosen when you land; rotating a phone afterwards does not re-lay it.
- The thin beam from the hovered explorer to the hologram panel (build guide 2.5) is not drawn.
- Explorer summaries are English only and live in the data file, not in i18n.
- A "Deep space" destination for Kepler, Pioneer, Dawn and NEAR Shoemaker.
- The Sojourner pebbles are visible during the driving game, before the "find the clue" page.
- Re-read the 2026 submission, judging and FAQ guides.
