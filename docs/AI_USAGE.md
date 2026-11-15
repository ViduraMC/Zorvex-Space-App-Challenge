# AI-use log

Space Apps requires teams to disclose how AI was used. Add a row for everything AI helped make.

## Who built what

- **Vidura:** the engine, the opening journey, the mini-game kit, the chat server and hosting; the Sojourner, Viking, Spirit and Opportunity, Phoenix, Ingenuity, Apollo 15 LRV and Surveyor 3 stories; reviewed and merged every teammate's story.
- **Yasassri:** the Pioneer 10 and 11 and InSight stories.
- **Kaushal:** the Apollo 12 ALSEP story.
- **Haritha:** the Apollo 11 EASEP story, with its story flow, deployment game and timeline.

## AI-use log

| Date | Who | Tool | What it was used for | Checked by a person? |
|---|---|---|---|---|
| 14 Nov 2026 | Vidura | Claude Code (Anthropic) | Wrote the engine, the mini-game kit, the opening journey, the Sojourner episode script and these docs | Code review by Vidura: pending |
| 14 Nov 2026 | Vidura | Claude Code (Anthropic) | Re-checked every explorer and Sojourner fact against the challenge resource pages only; downloaded and compressed NASA 3D Resources models | Sources linked in the app; a person must re-read them before submission |
| 14 Nov 2026 | Vidura | Claude Code (Anthropic) | Looked up and quoted NASA sources for the first 22 Sojourner facts (later replaced) (`src/episodes/sojourner/facts.json`) | Each fact has its source URL; a person must re-read them before submission |
| 14 Nov 2026 | Vidura | Claude Code (Anthropic) | Draft Sinhala and Tamil text for the shared buttons (`src/i18n/si.json`, `ta.json`) | **No.** A Sinhala and a Tamil speaker must review before release |
| 14 Nov 2026 | Yasassri | Antigravity AI | Implemented Pioneer 10 & 11 episode (`src/episodes/pioneer/`) with verified NASA facts, 3D Three.js models, interactive storytelling, and mini-games based on the mission brief | Reviewed by Vidura |
| 14 Nov 2026 | Yasassri | Antigravity AI | Implemented InSight Mars Lander episode (`src/episodes/insight/`) with official NASA 3D model, deployable SEIS/HP3 props, and Marsquake mini-game | Reviewed by Vidura |
| 14 Nov 2026 | Vidura | Claude Code (Anthropic) | Built the Viking episode from the team's brief (`docs/stories/viking.md`), re-checking each fact on the NASA pages; built the Titan rocket, Viking orbiter and descent hardware in code | Sources linked in the app; a person must re-read them before submission |
| 14 Nov 2026 | Vidura | AI assistant | `docs/stories/viking.md` (the Viking story brief) | Written with AI help; confirm how before submission |
| 14 Nov 2026 | Vidura | AI assistant | `docs/BUILD_GUIDE.md` (the journey specification) | Written with AI help; confirm how before submission |
| 14 Nov 2026 | Haritha | Copilot SDK in VS Code | Apollo 11 Act 1 slice, EASEP deployment mini-game, and draft English, Sinhala and Tamil story text | NASA facts checked against the linked NSSDCA page; Sinhala and Tamil need speaker review |
| 14 Nov 2026 | Haritha | Copilot SDK in VS Code | Expanded Apollo 11 story into four acts, including episode-local timeline interaction, scene effects, and English narration; added references to the two owner-approved NASA pages | Facts and sources were checked against the NASA pages listed in the episode and `docs/RESOURCES.md`; Sinhala and Tamil remain incomplete and need speaker review |
| 14 Nov 2026 | Vidura | Claude Code (Anthropic) | Reworked the ALSEP episode by Kaushal: re-checked every fact on NSSDCA 1969-099C and the Surveyor 3 page, shortened the lines, added the moonquake game and NASA's Lunar Module and Saturn V models | Sources linked in the app; a person must re-read them before submission |
| 14 Nov 2026 | Vidura | Claude Code (Anthropic) | Reworked the Pioneer and InSight episodes by Yasassri: re-checked every fact on the NASA pages, removed claims they do not make, added NASA's Pioneer 10 and InSight models, the seismograph game and voices | Sources linked in the app; a person must re-read them before submission |
| 14 Nov 2026 | Vidura | Claude Code (Anthropic) | Merged the Apollo 11 EASEP episode by Haritha: re-checked its facts on the three NSSDCA pages, split long narration into short beats, added NASA's Lunar Module and Saturn V models and voices | Sources linked in the app; a person must re-read them before submission |
| 15 Nov 2026 | Vidura | Claude Code (Anthropic) | Built the Spirit and Opportunity, Phoenix, Ingenuity, Apollo 15 LRV and Surveyor 3 stories (facts read on the challenge pages, scenes, games, English text, draft Sinhala and Tamil text, voices) and the mixed sound design (rocket, rotor, ignition, wind and world ambience) | Sources linked in the app; a person must re-read them. **Sinhala and Tamil need speaker review** |
| 15 Nov 2026 | Vidura | Claude Code (Anthropic) | UX pass over every screen on desktop and phone: language and sound controls everywhere, layout and touch fixes | Screens checked in a test browser; a person should try it on a real phone |
| 15 Nov 2026 | Vidura | Claude Code (Anthropic) | Chat panel with memory and Gemini answers from the facts, interactive first screen (NASA star map, drag to look, our own synthesised theme music), Home navigation, child-friendly Sources page, layout sweep of every story | Checked in a test browser on desktop and phone sizes |
| 15 Nov 2026 | Vidura | AI video generator (prompts by Claude Code) | The three opening-film clips on Home: the child waits by the rocket, boards it, and the rocket lifts off (`src/assets/video/home-*.mp4`). The waiting clip was regenerated on 15 Nov (evening) without the NASA patch the first version had. A small on-screen "AI-generated film" label shows while any clip plays. The boarding clip shows a plain round blue chest patch, with no text, for under a second | Watched frame by frame by Claude Code; Vidura chose the clips |
| 15 Nov 2026 | Vidura | Claude Code (Anthropic) | Submission graphics: the journey and architecture diagrams, the by-the-numbers, timeline, games, fact-engine and tech-stack panels (numbers counted from the repository), and app screenshots | Every number recounted from the code and data; Vidura reviewed the images |

## AI-generated content in the product

- **Opening film.** The three Home screen clips (waiting, boarding, lift-off) are AI-generated video, not NASA footage. They show an imagined rocket and child astronaut, not a real mission.
- **Voices.** Every recorded line (narrators, Viking 1, Viking 2, Sojourner, ALSEP, EASEP, InSight, Pioneer 10 and 11, Spirit, Opportunity, Phoenix, Ingenuity, the Apollo 15 rover, Surveyor 3, mission control) is
  AI-generated speech from the open Kokoro-82M model, run locally. The About page says so.

## What AI did not make

- Apart from the opening film and the voices above, no AI-generated images or video are in the product. 3D models are NASA's own (3D Resources)
  or simple ones built in code; planet textures are NASA data; sounds are synthesised in the browser.
- No NASA logos. Mission patches are our own design.

## AI in the product

"Talk to the machine" (built): our Cloud Run server (`server/ask`) asks Gemini 3.5 Flash-Lite to
answer only from that story's verified `facts.json`; an answer with a number that is not in the
facts is dropped. Offline, or when the server is slow, the app picks the best checked fact itself.
"Postcard": not built.
