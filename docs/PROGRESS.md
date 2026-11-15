# Progress

Updated: Sunday 15 Nov 2026, morning (Asia/Colombo).

## Now

- Live: https://zorvex-space-apps.web.app (Firebase Hosting, free, deployed by every push to main).
  https://zorvex.earth is live (DNS at Porkbun, Firebase certificate active since about 12:50).
- AI chat live on Cloud Run (zorvex-ask, asia-south1, Gemini 3.5 Flash-Lite); answers in English,
  Sinhala and Tamil from the facts only; an answer with an invented number is dropped.
- Code is on GitHub (private): https://github.com/ViduraMC/Zorvex-Space-App-Challenge.
- Data now comes only from the challenge resources plus NASA 3D Resources (mentors' rule). Sources page and hologram panel list every source.
- First screen uses NASA's Saturn V and crew escape suit models; explorers use NASA models where they exist.
- Opening journey works end to end: Home, take-off, destination, landing, explorers, hologram,
  launch, story. Back from a story returns to the explorers without replaying cutscenes.
- Sojourner episode plays end to end with four mini-games and awards its patch.
- Teammates' pull requests #1 (Pioneer, InSight), #2 (Apollo 11 EASEP) and #3 (Apollo 12 ALSEP)
  are merged into main after a review against CONTRIBUTING.md: every fact re-checked on the
  NASA pages (claims the pages do not make were removed), long lines split, NASA models used
  (Lunar Module, Saturn V, InSight, new Pioneer 10), voices recorded, conflicts resolved.
- Eleven playable stories: Sojourner, Viking, InSight, ALSEP, Apollo 11 EASEP, Pioneer, and new
  Spirit and Opportunity, Phoenix, Ingenuity, Apollo 15 LRV and Surveyor 3 (all three languages,
  English voices, every fact from the challenge pages; branch feature/remaining-stories).
- Home is now an opening film (AI-generated, see docs/AI_USAGE.md): the child waits by the rocket,
  boards it on Start, and it lifts off, then the destination choice. Falls back to the 3D launch site
  if a clip cannot play; reduced motion shows still frames.
- Opening film smoothness fix (15 Nov, afternoon): each clip has its own preloaded player (no reload
  on each cut), the 3D scene stops drawing under the film, and the timeline waits if a clip buffers.
  Measured in Chrome: 24 fps, 0 dropped frames in all three clips (before: boarding buffered, launch
  froze). Clips re-encoded from the originals, NASA suit patch no longer blurred (Vidura's decision).
- Opening film, final (15 Nov, evening): the waiting clip is a new version without the NASA patch
  (same encode: 1280x720 H.264, GOP 24, faststart, no audio), and a small "AI-generated film" label
  (English, Sinhala, Tamil) shows in the corner while any clip plays, as the Space Apps rules ask.
- Round 2 (15 Nov, midday): chat is a side panel with memory (last 6 turns), a floating
  "Talk to …" button in every story, Gemini answers in the machine's voice from the facts only;
  first screen has the real NASA star map all around (drag to look), the Moon, a tappable rocket and
  our own synthesised theme; Home button on the destination and explorers screens; title font
  Orbitron; Sources page is a card per machine; captions, bubbles and goals stay on screen and
  below the controls (automated sweep of every story, desktop and phone).
- UX pass over every screen (desktop and phone, English, Sinhala, Tamil): a language picker and a
  sound switch on Home, the destination choice, the explorers, the story player and Anatomy (a
  language change inside a story keeps the child's place); hologram panel no longer overlaps
  itself; tapping an explorer on a phone first opens its panel; the explorers fit a phone screen;
  every patch on the shelf names its machine; chat closes with Escape or a tap outside; no cloud
  blobs in the Home sky; the title no longer runs into the rocket.
- Sound design: WebAudio mix with a compressor, separate effects and ambience buses; rocket roar
  that follows the camera shake at take-off and landing, ignition, rotor, wind and world ambience
  (Earth, space, Moon, Mars); voices duck the ambience.
- Sinhala and Tamil: every interface, story, game and explorer text (proper names stay English; voices stay English). Needs a review by a Sinhala and a Tamil speaker.
- Anatomy 360°: six NASA models (Viking lander, Spirit/Opportunity, InSight, Ingenuity, Apollo Lunar Module, Pioneer 10), each part with what it did, what we learned and its NASA source. From the hologram panel and story end cards.
- Talk to the machine (free, offline): five ready questions in all three languages, typed questions in English, answers only from the story facts with sources. A real AI answer can plug in once we pick a free Space Apps offer.
- Pitch notes: docs/PITCH.md.
- New kit game `seismograph` (catch the shaking), used by ALSEP and InSight.

- Product renamed: The Abandoned Explorers, "Abandoned but not Forgotten."
- Viking 1 & 2 story playable end to end (10 pages, 3 stages: Earth, space, Mars).

- Voices: narrator, Viking 1 (male), Viking 2 (female), Sojourner and mission control, recorded with Kokoro (`npm run voices`).
- Take-off and landing: cockpit telemetry, clouds, speed streaks, curved Earth, entry heat and dust.
- Hologram globe shows each landing site with its source.
- Viking: 11 pages, with a real 1976 panorama to look around and Viking 2's colour photo.

## Next

1. Vidura: paste the Space Apps global offers list (it needs a login) so we can pick a free AI service for the chatbot.
1b. Deploy on GoDaddy (needs Vidura's account) and make the repository public.
1c. Vidura: DNS at Porkbun for zorvex.earth (A 199.36.158.100, TXT hosting-site=zorvex-space-apps, www CNAME zorvex-space-apps.web.app).
1d. A Sinhala and a Tamil speaker review the new story text.
2. Connect Vercel (public URL and pull-request previews).
3. Decide on the Moon globe image (only non-challenge, non-3D-Resources data left; see docs/RESOURCES.md section 3).
5. Route globe and filters in the hologram panel (build guide step 12): needs real traverse data.
6. Real explorer models from NASA 3D Resources instead of the stand-ins (build guide step 15).
7. Sinhala and Tamil episode text; our own voice recordings.
8. Phase 2: "Ask the machine" and "Postcard" (serverless, fact-locked).

## Not verified

- The new stories were played page by page in a test browser (skipping ahead), not each in one
  uninterrupted run. Hold-to-scan holds could not be completed in the throttled test browser.
- Not tested on a phone.

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
