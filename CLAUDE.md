# The Abandoned Explorers: rules for every AI session on this repo

Team Zorvex, NASA Space Apps Challenge 2026, Kandy (SLIIT Kandy UNI), 14 to 15 Nov 2026.
Challenge: "Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the
Moon and Mars". Read this file, `CONTRIBUTING.md` and `docs/FUN_CHECKLIST.md` before you change anything.

## What we are building

**The Abandoned Explorers** (tagline: *Abandoned but not Forgotten.*): an interactive 3D web
experience for children aged about 8 to 14.

1. **The journey** (`docs/BUILD_GUIDE.md` is the source of truth): Home on Earth at night with a
   rocket and a child, first-person take-off, choose Moon or Mars, first-person landing, then the
   explorers of that world on plinths (a memorial for silent machines, a living display for
   active ones). Hovering an explorer opens a hologram panel; Explore launches its story.
2. **The stories** (`src/episodes/<id>/`): the child **plays** each machine's true mission through
   mini-games while the machine tells its story in first person. Sojourner is the pilot episode
   and an example only: later episodes should look better and use more real NASA data.

Not a catalogue, not a quiz site. The child does what the real team did.

## Decisions already made (do not reopen without Vidura)

- **Stack:** Vite + TypeScript + plain three.js. No React. The build guide's sample code is
  React; we follow its story, screens and state machine with our own engine instead.
- **Title font:** Orbitron, a readable sci-fi face (Vidura, 15 Nov 2026; replaced the Didot look,
  which read poorly). It is one token, `--font-title`
  in `src/styles/tokens.css`. Comic style is one story style of several (`style: 'comic' | 'cinematic'`).
- **One canvas for the whole journey**; phases change only through `src/journey/store.ts`.
- **An episode is data.** Teammates never edit `src/engine/`. Missing something? Open an issue for Vidura.
- Episodes register themselves by existing; an explorer opens `#ep-<id>` when an episode with the
  same id exists, otherwise the "Story coming soon" page.

## Data sources (mentors' rule)

- **Facts, dates, numbers:** only from the challenge's own resources (`docs/RESOURCES.md`
  section 1) and the NASA pages named in a team story brief (`docs/stories/`). Check each one on
  the page itself; a brief is a guide, not a source.
- **3D models, textures, images:** NASA 3D Resources first. When NASA has none, another free
  source is fine (NASA image sites, CC0 or CC-BY with credit). No facts are taken from those.
- Every source goes in `src/data/sources.ts` (shown on the Sources page) and `docs/RESOURCES.md`.

## Rules

1. **Verify, never assume.** Every fact, number, date and link is checked on a NASA source before
   it is used, and stored with its source (`facts.json`, `src/data/explorers.*.json`). What you
   cannot verify is marked `TODO-VERIFY`. Never invent facts, quotes, final messages or route
   coordinates. `npm run check:facts` must show no errors.
2. **Fun is a requirement.** Run `docs/FUN_CHECKLIST.md` on every episode. If something is
   boring, say so and propose a fix.
3. **Text:** never in WebGL, never inline in code. It comes from i18n files (English first, then
   Sinhala and Tamil). At most two short lines on screen.
4. **Design values** come from tokens in `src/styles/tokens.css`; product values from `src/config.ts`.
5. Every cutscene can be skipped and respects reduced motion. Every control works by keyboard and touch.
6. **Cost:** free tiers and the Space Apps Global Offers only (Google Cloud credit, GoDaddy Registry domain
   and hosting). The AI chat runs on our server (server/ask) with a small Gemini model; the key lives
   in `GEMINI_API_KEY` on the server, never in the client.
7. **AI-use log:** add a line to `docs/AI_USAGE.md` for anything AI helped make. AI images need a
   visible watermark and must not contain NASA logos. (Exception, Vidura, 15 Nov 2026: the Home
   opening film has no on-screen label and keeps the suit patch the generator drew; both are
   disclosed in `docs/AI_USAGE.md`.)
8. **Git:** small commits with Conventional Commit messages; `main` always deployable; work on
   `episode/<id>` or `feature/<name>` and open a pull request. Never push without Vidura's OK.
9. After each step run `npm run lint`, `npm run typecheck`, `npm test`, `npm run check:facts`
   and `npm run build`, then update `docs/PROGRESS.md`.

## The mini-game kit (`src/engine/play/`)

`waypointDrive` (plan, send, wait out the signal delay), `directDrive` (joystick, real gravity),
`holdToScan`, `findHidden`, `timingTap` (echo or dip), `balance` (hold or drag),
`resourceManage`, `counterRace` (plan versus what really happened), `seismograph` (catch the shaking).
Each one already has the goal line, tutorial hint, instant feedback, funny fail with instant
retry, Skip and a win moment. **Real numbers become game numbers.**

## Creative pass (before building any episode)

Propose 3 play mechanics (one of your own), score each 1 to 5 on: fun on a phone, teaches the
real science, uses real NASA data, buildable in 3 hours, demoable in 30 seconds. Pick one and
say why in two lines. Name the wow moment, the emotional beat, and what could be boring (with a
fix). Show the owner and wait for their OK.

## Deadlines (Asia/Colombo)

Feature freeze Sunday 15 Nov 15:00. We submit by 21:00. Official deadline 23:59.

## Standing instructions

- Commits are authored by the team member only. No AI co-author lines (no `Co-Authored-By: Claude`) in commit messages. (Vidura, 14 Nov 2026)
- Facts only from the challenge resources and the NASA pages in our story briefs; models and images may come from other free sources when NASA has none (see "Data sources" above). (Vidura, 14 Nov 2026)
- Product name: **The Abandoned Explorers**; tagline: **Abandoned but not Forgotten.** (Vidura, 14 Nov 2026)
- When teammates' story branches are merged, review them with the checklist in CONTRIBUTING.md and fix what is wrong. (Vidura, 14 Nov 2026)
- No paid tiers. Use only free tiers and the Space Apps Global Offers (they also earn points). (Vidura, 15 Nov 2026)
