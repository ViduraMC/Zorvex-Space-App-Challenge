# Progress

Updated: Saturday 14 Nov 2026, about 13:45 (Asia/Colombo).

## Now

- Foundation built and running locally. Nothing is pushed or deployed yet.
- Opening journey works end to end: Home, take-off, destination, landing, explorers, hologram,
  launch, story. Back from a story returns to the explorers without replaying cutscenes.
- Sojourner episode plays end to end with four mini-games and awards its patch.

## Next

1. Vidura: read the changes in `CLAUDE.md` ("Decisions already made"), then say how the stories should go.
2. Create the GitHub repository, push, connect Vercel (public URL and pull-request previews).
3. Verify the 14 roster records marked `TODO-VERIFY` (`npm run check:facts`).
4. Real terrain for the Pathfinder site and the "Spot the machine" photo (recipe in `docs/RESOURCES.md`).
5. Route globe and filters in the hologram panel (build guide step 12): needs real traverse data.
6. Real explorer models from NASA 3D Resources instead of the stand-ins (build guide step 15).
7. Sinhala and Tamil episode text; our own voice recordings.
8. Phase 2: "Ask the machine" and "Postcard" (serverless, fact-locked).

## Blockers

- No GitHub repository and no Vercel login yet, so no deploy and no preview links.
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
