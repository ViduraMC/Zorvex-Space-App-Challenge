# AI-use log

Space Apps requires teams to disclose how AI was used. Add a row for everything AI helped make.

| Date | Who | Tool | What it was used for | Checked by a person? |
|---|---|---|---|---|
| 14 Nov 2026 | Vidura | Claude Code (Anthropic) | Wrote the engine, the mini-game kit, the opening journey, the Sojourner episode script and these docs | Code review by Vidura: pending |
| 14 Nov 2026 | Vidura | Claude Code (Anthropic) | Re-checked every explorer and Sojourner fact against the challenge resource pages only; downloaded and compressed NASA 3D Resources models | Sources linked in the app; a person must re-read them before submission |
| 14 Nov 2026 | Vidura | Claude Code (Anthropic) | Looked up and quoted NASA sources for the first 22 Sojourner facts (later replaced) (`src/episodes/sojourner/facts.json`) | Each fact has its source URL; a person must re-read them before submission |
| 14 Nov 2026 | Vidura | Claude Code (Anthropic) | Draft Sinhala and Tamil text for the shared buttons (`src/i18n/si.json`, `ta.json`) | **No.** A Sinhala and a Tamil speaker must review before release |
| 14 Nov 2026 | Bimsara | Antigravity AI | Implemented Pioneer 10 & 11 episode (`src/episodes/pioneer/`) with verified NASA facts, 3D Three.js models, interactive storytelling, and mini-games based on the mission brief | Reviewed by Vidura |
| 14 Nov 2026 | Bimsara | Antigravity AI | Implemented InSight Mars Lander episode (`src/episodes/insight/`) with official NASA 3D model, deployable SEIS/HP3 props, and Marsquake mini-game | Reviewed by Vidura |
| 14 Nov 2026 | Vidura | Claude Code (Anthropic) | Built the Viking episode from the team's brief (`docs/stories/viking.md`), re-checking each fact on the NASA pages; built the Titan rocket, Viking orbiter and descent hardware in code | Sources linked in the app; a person must re-read them before submission |
| 14 Nov 2026 | Vidura | AI assistant | `docs/stories/viking.md` (the Viking story brief) | Written with AI help; confirm how before submission |
| 14 Nov 2026 | Vidura | AI assistant | `docs/BUILD_GUIDE.md` (the journey specification) | Written with AI help; confirm how before submission |
| 14 Nov 2026 | Vidura | Claude Code (Anthropic) | Reworked the ALSEP episode by Kaushal: re-checked every fact on NSSDCA 1969-099C and the Surveyor 3 page, shortened the lines, added the moonquake game and NASA's Lunar Module and Saturn V models | Sources linked in the app; a person must re-read them before submission |
| 14 Nov 2026 | Vidura | Claude Code (Anthropic) | Reworked the Pioneer and InSight episodes by Bimsara and Yasassri: re-checked every fact on the NASA pages, removed claims they do not make, added NASA's Pioneer 10 and InSight models, the seismograph game and voices | Sources linked in the app; a person must re-read them before submission |

## AI-generated content in the product

- **Voices.** Every recorded line (narrators, Viking 1, Viking 2, Sojourner, ALSEP, InSight, Pioneer 10 and 11, mission control) is
  AI-generated speech from the open Kokoro-82M model, run locally. The About page says so.

## What AI did not make

- No AI-generated images or video are in the product (the voices above are the only AI-generated media). 3D models are NASA's own (3D Resources)
  or simple ones built in code; planet textures are NASA data; sounds are synthesised in the browser.
- No NASA logos or insignia. Mission patches are our own design.

## In the product (planned, phase 2)

"Ask the machine" and "Postcard" will call a small Claude model through a serverless function,
answering only from that episode's verified `facts.json`, with canned text as the offline fallback.
Not built yet.
