# AI-use log

Space Apps requires teams to disclose how AI was used. Add a row for everything AI helped make.

| Date | Who | Tool | What it was used for | Checked by a person? |
|---|---|---|---|---|
| 14 Nov 2026 | Vidura | Claude Code (Anthropic) | Wrote the engine, the mini-game kit, the opening journey, the Sojourner episode script and these docs | Code review by Vidura: pending |
| 14 Nov 2026 | Vidura | Claude Code (Anthropic) | Looked up and quoted NASA sources for the 22 Sojourner facts (`src/episodes/sojourner/facts.json`) | Each fact has its source URL; a person must re-read them before submission |
| 14 Nov 2026 | Vidura | Claude Code (Anthropic) | Draft Sinhala and Tamil text for the shared buttons (`src/i18n/si.json`, `ta.json`) | **No.** A Sinhala and a Tamil speaker must review before release |
| 14 Nov 2026 | Vidura | AI assistant | `docs/BUILD_GUIDE.md` (the journey specification) | Written with AI help; confirm how before submission |

## What AI did not make

- No AI-generated images, video or audio are in the product. 3D objects are built in code; planet
  textures are NASA data; sounds are synthesised in the browser.
- No NASA logos or insignia. Mission patches are our own design.

## In the product (planned, phase 2)

"Ask the machine" and "Postcard" will call a small Claude model through a serverless function,
answering only from that episode's verified `facts.json`, with canned text as the offline fallback.
Not built yet.
