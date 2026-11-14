# Progress

Updated: 14 Nov 2026 (Asia/Colombo).

## Now

- Apollo 11 / EASEP: expanded to the four-act story. Act 1 includes the deployment game and Moon
  Chapter A; Act 2 has all six machine cards; Act 3 has a keyboard/touch timeline with 23 events;
  Act 4 includes the long-days sequence, shutdown error, epilogue, and patch.
- Local test links support `?act=1..4`, starting at that act and continuing to the ending.
- The Apollo CSM and Apollo 11 anniversary pages are approved and registered in the source page,
  Apollo hologram, and `docs/RESOURCES.md`.
- Browser smoke checks confirmed the Act 2 Saturn card, all 23 timeline markers through shutdown,
  and Act 4 error/patch progression. The complete story has not been played in one browser run.
- Validation passed with Node 22.18: lint, typecheck, all 13 tests, fact checks (25 Apollo facts;
  0 errors and 0 warnings), and production build.
- Fun checklist recorded in `docs/FUN_CHECKLIST.md`: phone and keyboard review and Sinhala/Tamil
  speaker review remain outstanding; long Act 1 narration and read-through cards need pacing work.
- Code is on GitHub (private): https://github.com/ViduraMC/Zorvex-Space-App-Challenge. Not deployed yet.
- Sources page and hologram panel list the challenge resources, NASA 3D Resources, and the two
  approved additional Apollo sources.
- First screen uses NASA's Saturn V and crew escape suit models; explorers use NASA models where they exist.
- Opening journey works end to end: Home, take-off, destination, landing, explorers, hologram,
  launch, story. Back from a story returns to the explorers without replaying cutscenes.
- Sojourner episode plays end to end with four mini-games and awards its patch.

## Next

1. Finish Apollo phone, keyboard, and reduced-motion review; address pacing and long narration flagged in the Fun Checklist.
2. Complete Apollo Sinhala and Tamil text with fluent-speaker review.
3. Decide on the Moon globe image (see `docs/RESOURCES.md` section 3).
4. Create the GitHub repository, push, connect Vercel (public URL and pull-request previews).
5. Stories for each explorer (Vidura is sending them).
6. Route globe and filters in the hologram panel (build guide step 12): needs real traverse data.
7. Real explorer models from NASA 3D Resources instead of the stand-ins (build guide step 15).
8. Phase 2: "Ask the machine" and "Postcard" (serverless, fact-locked).

## Blockers

- No Vercel login yet, so no deploy and no preview links. The repository must be made public before submission.
- The requested global pause/resume and subtitle shortcuts and `?debug` overlay are not implemented.
  The episode stays within the repository's no-engine-edit rule; agree on an engine-level exception
  before adding controls that the current player API cannot provide episode-locally.
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
