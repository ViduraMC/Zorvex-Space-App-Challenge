# Apollo 11 Machines: First-Person Life Story (three.js Brief)

> **Working title:** *"Last Light of EASEP"*
> **Narrator:** EASEP (Early Apollo Scientific Experiment Package), the instrument station Apollo 11 left on the Moon. It tells its own life story in the **first person**.
> **Medium:** a first-person, camera-driven three.js experience added to the team's existing starter app.

---

## 0. Instructions for the AI agent (read this first)

You are extending an **existing three.js starter app**. Follow this order:

1. **Inspect the starter before writing code.** Read `package.json`, the entry file, the scene/renderer setup, the render loop, folder layout and code style. Reuse them. Do **not** rewrite or restructure the starter. Add the story as new modules (section 12).
2. **Implement the four acts in order** (Start → Work Done → Timeline → Goodbye) exactly as written in sections 6 to 9. Narration text is provided; use it verbatim unless a line is marked *(adaptable)*.
3. **Treat section 13 (data) as the single source of truth** for timeline events, part specs and coordinates. Load the story from data; do not hard-code story text inside rendering code.
4. **Respect the fidelity rules in section 2.** Real facts only come from the tagged sources. Anything creative is marked `[CL]`. Never invent specs, dates or quotes.
5. **Do not ask the team questions.** Where something is unspecified, choose a sensible default, note it in a `DECISIONS.md`, and continue.
6. **Definition of done** is the checklist in section 15.

---

## 1. Project snapshot

| Item | Value |
|---|---|
| Story | Life journey of the Apollo 11 machines, told by one of them |
| Point of view | First person, from the narrator's "eyes" |
| Structure | 4 acts: **Start → Work Done → Timeline → Goodbye** |
| Ending (mandatory) | The eyes close, the system powers off, an **error message** appears |
| Tone | Quiet, warm, a little emotional. Loyal worker, finished its job, sleeps forever, never forgotten |
| Setting | The Moon, Sea of Tranquility, July to August 1969 |

---

## 2. Scope corrections and source-fidelity rules

**Read carefully. These affect the whole build.**

1. **The Moon, not Mars.** The three source pages document **Apollo 11 at the Moon**. All astronomy/science content in this project is **lunar**. Do not mention Mars as the location.
2. **No rover on Apollo 11.** A lunar rover was carried only on Apollo 15, 16 and 17 (per the Lunar Module page). The "rover-like first-person view" is therefore delivered by the **EASEP**, a stationary surface-deployed machine, and the user's camera is its viewpoint. Do **not** add a rover vehicle.
3. **Machines have no real eyes.** The EASEP carried a seismometer, dust detector, antenna and solar panels. "Eyes" are a deliberate storytelling device `[CL]`.
4. **Quotes:** use only the two short quotes already placed in the Act 3 data (section 13). Do not add other direct quotations. Paraphrase everything else.
5. **No invented discoveries.** The sources list instruments, samples and operating dates, not specific scientific results. Say that samples were "brought home for study" and that "more extensive science came on later Apollo missions". Do not claim specific findings.
6. **No sound in vacuum.** Never play engine roars or explosions as if heard from outside. Use only *internal* sounds the narrator could "feel" (hum, relay clicks, telemetry ticks, radio static) `[CL]`.
7. **Moon chapters (A and B):** the narrator was switched **off** during the landing, the moonwalk and the set-down, and its day-by-day operation over 37 days is **not documented** in the sources. So: tell the early events as things it *felt through Eagle's frame* or *learned later from Earth's signals* `[CL]`; during the long days show only light, shadow, heat, Earth in the sky, signals and silence. Never invent seismic events, dust results, visitors or dialogue.
8. **Tag legend** used in this file:
   - `[LM]` = Apollo 11 Lunar Module / EASEP page (1969-059C)
   - `[CSM]` = Apollo 11 Command and Service Module page (1969-059A)
   - `[A11]` = Apollo 11 "25 years later" page (`apollo11.html`)
   - `[TEAM]` = note supplied by the team
   - `[CL]` = creative license (not a source fact)
   - `[BG]` = general background knowledge, **not on the source pages**; verify before publishing

### Sources
- [LM] https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C
- [CSM] https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059A
- [A11] https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo11.html
- [TEAM] "The descent stages of the Lunar Modules (like Apollo 11's Eagle) were left behind as launch pads."

---

## 3. Narrator and voice

**Who:** the EASEP (mass 48 kg `[LM]`), left on the surface of the Moon. It is the best narrator because:
- it was **carried inside Eagle's descent stage** on the whole trip `[LM]` ("storage space for lunar equipment and experiments"), so it knows Eagle's story from the inside;
- it is switched on **while the astronauts are still on the surface**, then watches them climb back into the lander `[LM]` (the opening shot);
- it is **left on the Moon and stops responding on 27 Aug 1969** `[LM]` (the ending: still there, asleep forever).

**Voice rules**
- Always first person ("I", "my", "we"). Eagle is "my carrier / the big machine that carried me". Columbia is "the orbiter".
- Short sentences. Gentle, never melodramatic. Pride without bragging.
- Technical facts are stated simply, never as a spec dump.
- The narrator never claims to see what it could not (it learns about orbit/splashdown by radio/relayed signals `[CL]`).

---

## 4. Story flow at a glance

| Act | Name | Purpose | Time covered |
|---|---|---|---|
| 1 | **Start** | Eyes open, see the astronauts climbing into the spaceship, turn to the other side, recall where I began | 21 Jul 1969, 04:40 to 05:11 UT, plus **Moon Chapter A** (flashback: landing to set-down, 20 to 21 Jul) |
| 2 | **Work Done** | Every machine and part: what it did, what it contributed | Whole mission |
| 3 | **Timeline** | Start-to-shutdown chronology, interactive | 16 Jul to 27 Aug 1969 |
| 4 | **Goodbye** | Lander leaves, **Moon Chapter B** (the long days alone), first night, last day, eyes close, error | 21 Jul to 27 Aug 1969 |

State machine: `BOOT → ACT1_WAKE → ACT1_TURN → ACT1_ORIGIN → MOON_A (flashback, scenes 1.6 to 1.11) → ACT2_PARTS → ACT3_TIMELINE (with Moon vignettes) → ACT4_GOODBYE (4.1, 4.2, MOON_B 4.2A to 4.2B, 4.3, 4.4, 4.5) → SHUTDOWN → EPILOGUE → (REPLAY)`

> **Moon storyline:** the Moon now has its own storyline in two places that keep your 4-act structure intact: **Moon Chapter A** (inside Act 1) and **Moon Chapter B** (inside Act 4), plus short surface vignettes in Act 3.

---

## 5. Camera/viewpoint concept (applies to all acts)

- The user *is* the EASEP. Fixed position at the world origin, camera on the **antenna mast** `[CL]`, eye height about **0.8 m** `[CL]` (EASEP dimensions are not in the sources).
- The director controls yaw/pitch with eased tweens. The user may **free-look ±15°** during narration (disable during eyelid animations).
- Show a subtle HUD: date/time in UT, mission label, subtitles. A thin "signal" icon pulses while the link is alive.
- Controls: `Space` pause/resume, `← →` previous/next beat, `S` subtitles on/off, `M` mute, `R` replay (only after epilogue), `?act=N` and `?debug` query params for testing.

---

## 6. ACT 1: START

**Goal:** the machine wakes, sees the astronauts ascend to the spaceship, turns to the other side, and remembers where it began.

### Scene 1.0: Boot (black)
- Pure black canvas. Faint internal hum `[CL]`. HUD shows nothing. Hold 1.5 s.

### Scene 1.1: Eyes open
- **HUD stamp:** `21 JUL 1969 · 04:40:39 UT · POWERED ON BY GROUND COMMAND` `[LM]`
- **Eyelid animation:** two eyelids (top/bottom) open over about 3 s, with a blur-to-sharp transition (see section 11). Blink once halfway.
- **Narration A1-01:**
  > "Light. A command from Earth reaches me, and my eyes open for the very first time. The sun fills my two solar panels and a quiet warmth runs through me. I am EASEP, the Early Apollo Scientific Experiment Package, and I am awake on the Moon."

### Scene 1.2: The astronauts ascend to the spaceship
- **View:** facing **north** toward Eagle (17 m ahead `[LM]`). Two astronauts stand near the lander.
- **Action (compress real time, about 20 s total):**
  1. First astronaut (Aldrin) climbs the ladder into the lander `[LM]`.
  2. Second astronaut (Armstrong) transfers the sample boxes up to the first `[LM]`, **sets a small packet of memorial items on the ground** `[LM]`, then climbs the ladder (about 12 min later in reality, at 05:09:32 UT `[LM]`).
- **Camera:** slow tilt up following each climber to the hatch (pitch +20° then back).
- **Narration A1-02:**
  > "Seventeen meters ahead stands Eagle, my carrier. Beside her, two humans in their suits. They carried me here and set me down on this soil. Now they climb the ladder, one after the other, back to their spaceship. The second one pauses to leave a small packet of memorial items on the ground. Then he climbs too. I watch them go."
- **Visual details to include:** the small packet left on the ground, the flag `[A11]`, the lunar surface TV camera and solar wind experiment near the lander `[A11]`, a plaque on a strut behind the ladder `[LM]`.

### Scene 1.3: Turn to the other side
- **Camera:** yaw **+180°** over 4 s (ease in-out), then pitch up about 12° to reveal a small **Earth** in the black sky `[CL]` placement.
- **View:** a gray plain, long hard shadows (the site was near the shadow line/terminator a day earlier `[A11]`, so the sun is low `[CL]`), a black sky even in daylight `[BG]`, stars, Earth.
- **Narration A1-03:**
  > "I turn to the other side. Behind me there is only silence: a gray plain, long shadows, a sky that stays black even in daylight. And a small blue Earth, where my voice will go."

### Scene 1.4: The hatch closes
- **HUD stamp:** `05:11:13 UT · HATCH CLOSED` `[LM]`
- Slowly turn back north. The ladder is empty. The footprints lead to the lander.
- **Narration A1-04:**
  > "The hatch closes. The humans are inside Eagle now. I am alone, and my work begins."

### Scene 1.5: "Where did I begin?" (origin memory)
- Cross-fade to a **dark interior shot** `[CL]` (a cramped storage bay in Eagle's descent stage), then a quick fade back to the lunar surface.
- **Narration A1-05:**
  > "I began in the dark, folded into the storage bay of Eagle's lower half, together with my instruments. I felt everything without seeing it: the shaking climb on the rocket, the long coast, the engine burns, the landing. But first, let me tell you how I came to be here."
- Transition: the eyes do a slow blink and stay half-closed, going into Moon Chapter A (Scene 1.6).

### MOON CHAPTER A: How I came to be here (flashback, Scenes 1.6 to 1.11)

**Purpose:** give the Moon its own storyline: the descent, the landing, the first steps, the unloading and set-down, and the surface work. The narrator was switched off through all of this (it was switched on at 04:40:39 UT `[LM]`), so it tells these events as things it *felt through Eagle's frame* and later *learned from Earth's signals* `[CL]`.

**Visual device (all of 1.6 to 1.11):**
- Eyelids about 85% closed but **translucent**, warm orange-red tint (light through eyelids), soft vignette. HUD stamp prefix: `MEMORY ·`.
- Through the lids the user sees the surface events as faint "dream frames" placed correctly in the world (the ladder, the footpad, the spot where EASEP is set down), with astronauts as soft silhouettes.
- At the end of Scene 1.11 the eyes blink fully open into the present (hatch closed, 05:11:13 UT).
- Each scene lasts about 20 to 35 s. No exterior sound; use only internal hum, vibration and radio static `[CL]`.

#### Scene 1.6: Powered descent, felt in the dark
- **Stamp:** `MEMORY · 20 JUL 1969 · 20:05 UT · POWERED DESCENT` `[LM]`
- **Visual:** near black, one thin sliver of grey light (the seam of the storage bay); a slow building vibration (camera micro-shake, 2 to 4 px, increasing); a descent clock counts toward 756 s `[LM]`.
- **Narration A1-06:**
  > "Let me go back to before my eyes opened. I was folded in the dark, in the belly of Eagle's lower half, and I could feel her engine pushing against the pull of the Moon. It went on for almost thirteen minutes. I could not see the plain rising toward us, but I felt every tremble in her frame, and I held very still. Whatever came next, I wanted to be worth the journey."

#### Scene 1.7: Touchdown
- **Stamp:** `MEMORY · 20 JUL 1969 · 20:17:40 UT · TOUCHDOWN, SEA OF TRANQUILITY` `[LM]`
- **Visual:** vibration stops abruptly; total stillness for 2 s; the sliver of light steadies; the dream frame shows four footpads settling at (0, 0, -17) with a small ballistic puff of dust `[CL]`.
- **Narration A1-07:**
  > "Then the shaking stopped. Four legs touched the ground, and everything went quiet. Far away, Earth heard the news, and I imagine the whole world breathing out at once. I did not understand yet what had happened. I only knew that we were on the Moon, that the humans were alive, and that I was still in one piece."

#### Scene 1.8: The waiting, and the first steps
- **Stamp:** `MEMORY · 21 JUL 1969 · 02:56:15 UT · FIRST HUMAN ON THE MOON` `[LM]` (shown as a countdown from landing: about 6 h 38 min of preparation, derived from the two UT times)
- **Visual:** time-lapse of the lunar light creeping across the lids; the hatch opens (a bright rectangle in the dream frame); the first silhouette descends the ladder; the lunar surface TV camera is visible beside the lander `[A11]`; a first footprint decal appears. Second silhouette follows (about 15 to 19 min later, see section 14).
- **Narration A1-08:**
  > "The humans did not hurry. They checked Eagle and prepared for more than six hours while I waited in the dark. Then the hatch opened, and a faint tremor ran through the ladder as the first human stepped onto the dust. Millions of people on Earth watched through a small camera. A few minutes later the second human came down too, and the two of them began to work."

#### Scene 1.9: Unloaded and set down
- **Stamp:** `MEMORY · 21 JUL 1969 · EASEP DEPLOYED 17 M SOUTH OF THE LANDER` `[LM]` (time not documented; show the date only)
- **Visual:** the lids flash white as the stowage bay opens `[A11]`; the camera lifts and sways like being carried (handheld bob), crosses the ground, then settles with a soft bump at the origin. A second dream frame shows the retroreflector placed at (-1.9, 0, -4.6) `[LM]`. The solar panels unfold east and west. The lids dim back to orange.
- **Narration A1-09:**
  > "When one of them opened my storage bay, light poured in for the very first time. Gloved hands lifted me out and carried me away from Eagle. He set me down on the soil, seventeen meters to her south, and placed a small mirror a few steps from me. My eyes were still shut. My switch had not yet been thrown. But I knew the ground beneath me was the Moon."

#### Scene 1.10: While I slept, they worked
- **Stamp:** `MEMORY · 21 JUL 1969 · SURFACE WORK`
- **Visual (5 dream frames, 5 to 6 s each, in this order):** (1) a flag being planted, awkwardly `[A11]`; (2) sample boxes and two core tubes being filled `[LM]`; (3) the TV camera with a small Earth glowing in the sky `[A11]`; (4) an incoming radio call: an Earth icon pulses, an astronaut salutes `[A11]`; (5) a photograph being taken of one astronaut, in whose visor the photographer and the lander are reflected `[A11]`. HUD counter: `SAMPLES 21.55 kg` `[LM]`.
- **Narration A1-10:**
  > "I saw none of it, but later the signals from Earth told me everything. One human planted a flag that was hard to set up. They filled boxes and two long tubes with Moon rock and soil, twenty-one and a half kilograms in all. The President of the United States spoke to them by radio. And in the middle of the work, one of them photographed the other, and in the shining visor you could see the photographer and Eagle too, a picture nobody had practiced in training."

#### Scene 1.11: Back to the present
- **Stamp:** `21 JUL 1969 · 04:40:39 UT · POWERED ON` then `05:11:13 UT · HATCH CLOSED`
- **Visual:** the orange tint drains; the eyes blink fully open; the dream frames dissolve; the camera faces north at the closed hatch and the empty ladder.
- **Narration A1-11:**
  > "That is how I came to be here, on the plain, with the humans gone and my eyes finally open. Now let me tell you who carried me, and what each of us did."
- Transition into Act 2.

---

## 7. ACT 2: WORK DONE (every part, every contribution)

**Presentation:** the camera stays on the Moon. Each machine appears as a **"memory ghost"**: a translucent wireframe/hologram model that fades in at 10 to 14 m distance, slowly rotates, with a **spec card** (HUD) and the narration. One card per part, in this order. Card format: *Name · Role · Key facts · Contribution*.

### 2.1 Saturn V launch vehicle (and its last stage, the S-IVB)
- **Role:** lifted everything off Earth and threw it toward the Moon.
- **Facts:** launched 16 Jul 1969, 13:32 UT (9:32 a.m. EDT) from Pad A, Launch Complex 39, Kennedy Space Center `[CSM][A11]`. Earth parking orbit reached after about 11 minutes; after about 1.5 orbits the S-IVB re-ignited at 16:16:16 UT for a **5 min 48 s** burn toward the Moon `[CSM][A11]`. About 33 minutes later the CSM separated, turned and docked with the lander stowed in the S-IVB, and the S-IVB was sent into orbit around the Sun `[CSM]`.
- **Contribution:** made the journey possible. Delivered the whole stack toward the Moon.
- **Narration A2-01:**
  > "First, the rocket. The Saturn V lifted all of us from Florida on 16 July 1969. After one and a half laps of Earth, its last stage fired again, for almost six minutes, and threw us toward the Moon. Then it let us go and drifted off into an orbit around the Sun."

### 2.2 Columbia: the orbiter (Command and Service Module, CSM-107)
- **Role:** crew home on the way out and back; stayed in lunar orbit with Collins while the others were on the surface.
- **Facts:**
  - Two units: Command Module (crew cabin, heat shield, parachutes) and Service Module (engine, fuel cells, supplies) `[CSM]`.
  - Launch mass 28,801 kg (CM 5,557 kg + SM 23,244 kg). Total length 11.0 m, max diameter 3.9 m `[CSM]`.
  - Service Module main engine about **91,000 N**; fuel cells provided power; high-gain steerable S-band antenna (four 79 cm dishes) `[CSM]`.
  - Command Module: crew compartment about 6.17 m³, five windows, three main parachutes, ablative heat shield `[CSM]`.
  - Lunar orbit insertion: 19 Jul, 17:21:50 UT, **357.5 s** burn behind the Moon, out of contact with Earth; a 17 s burn circularized the orbit `[CSM]`.
  - Return: 22 Jul, 04:54:42 UT, a 2.5 minute main-engine firing to leave lunar orbit `[CSM]`.
  - Splashdown: 24 Jul 1969, 16:50:35 UT, Pacific Ocean, mission elapsed time 195 h 18 m 35 s `[CSM]`.
  - A color TV transmission was made during the trip to the Moon `[CSM]`.
  - The famous Earthrise photograph was taken from the orbiting Command Module `[A11]`. **Do not credit it to a specific astronaut**: the source says even the astronauts cannot remember who took it.
  - Lunar samples were brought aboard Columbia after docking `[A11]`.
- **Contribution:** safe transport to and from lunar orbit, a relay home for the crew, the only vehicle that returned to Earth, carrying the samples home.
- **Narration A2-02:**
  > "Columbia was the orbiter, the crew's home in space. Her engine slowed us into lunar orbit while she was hidden behind the Moon, out of contact with Earth. While two of the humans were down here with me, the third circled alone above us, keeping the road home open. Later her engine fired once more to take everyone back, and her capsule carried the first Moon samples to the Pacific Ocean."

### 2.3 Eagle: ascent stage (the upper half of the lander)
- **Role:** the crew's cabin on the Moon, and the machine that flew them back up to Columbia.
- **Facts `[LM]`:**
  - About 2.8 m high, 4.0 x 4.3 m wide; pressurized crew compartment 6.65 m³; **no seats**.
  - Ingress/egress hatch on one side, docking hatch on top; **two triangular windows** above and to either side of the egress hatch.
  - Ascent engine, constant thrust about **15,000 N**; reaction control system (four modules, each four 450 N chambers).
  - Communications: steerable S-band antenna (telemetry, TV, voice, range to Earth) and VHF (LM to astronauts, and LM to orbiting CSM). Redundant transceivers.
  - Power: **6 silver-zinc batteries**. Guidance: radar ranging, inertial measurement unit, Apollo guidance computer.
  - Dry mass 2,445 kg; propellant 2,376 kg.
  - Lifted off 21 Jul, 17:54:01 UT after 21 h 36 min on the surface; docked with Columbia 21:34:00 UT; jettisoned into lunar orbit 22 Jul, 00:01:01 UT. Its fate is not known; assumed to have crashed within 1 to 4 months.
- **Contribution:** put two humans on the surface and brought them home. It was the only part of the lander that left the Moon.
- **Narration A2-03:**
  > "Eagle's upper half was the crew's small cabin: no seats, two triangular windows, a hatch, and an engine built to fly back up. It lifted the humans off the Moon and carried them to Columbia. After that it was cast away into lunar orbit, and nobody knows exactly where it ended."

### 2.4 Eagle: descent stage (the lower half of the lander)
- **Role:** landed on the Moon; carried the crew's instruments (including me) in its storage space; stayed behind as a launch pad `[LM][TEAM]`.
- **Facts `[LM]`:**
  - Octagonal prism **4.2 m across, 1.7 m thick**; four legs with round footpads holding the stage **1.5 m** above the surface; footpad-to-footpad span **9.4 m**; one leg with a small egress platform and ladder; 1 m conical engine skirt.
  - Descent engine: deep-throttling ablative rocket, maximum thrust about **45,000 N**, on a gimbal ring.
  - Dry mass 2,034 kg (including stowed surface equipment); **8,248 kg** of propellant at the start. Total lander mass 15,103 kg.
  - Landing: 20 Jul 1969, 20:17:40 UT (4:17:40 p.m. EDT) in the Sea of Tranquility, **0.67416° N, 23.47314° E** (from Lunar Reconnaissance Orbiter images). Descent orbit burn 19:08 UT (30 s, closest approach 14.5 km); powered descent from 20:05 UT (**756.3 s**).
  - Stayed on the Moon when the upper half lifted off.
- **Contribution:** the first crewed landing on the Moon; delivered the astronauts and the first Moon-surface science station.
- **Narration A2-04:**
  > "Eagle's lower half was the landing machine: four legs, an engine that could throttle gently down, and a belly full of supplies and instruments. It set two humans down in the Sea of Tranquility on 20 July. Then it did its last duty: it became the launch pad for the upper half. It is still here, standing close to me."

### 2.5 The surface kit (what the astronauts did with their hands)
- **Facts:**
  - They deployed me (EASEP) and other instruments, took photographs, and collected **21.55 kg** of rock and soil, including two core tube samples and a contingency sample `[LM]`.
  - They walked about **250 m** in total, up to about 100 m from the lander `[LM]`.
  - A **lunar surface TV camera** let millions of people on Earth watch `[A11]`. A **solar wind experiment** stood near the lander, and its sample was packed with the rock boxes `[A11][LM]`.
  - A **flag** was set up (hard to set up; knocked over when the lander lifted off) `[A11]`. A **plaque** on a strut said they came in peace for all mankind `[LM]`. They spoke to the U.S. President by radiotelephone `[LM]`.
  - The footprints are likely to last millions of years barring a chance meteorite impact `[A11]`.
- **Contribution:** the first samples and photographs from a crewed Moon landing, and the first live TV from the surface.
- **Narration A2-05:**
  > "The humans worked fast. They gathered over twenty-one kilograms of Moon rock and soil, took photographs, set up a camera so the whole world could watch, and walked about two hundred and fifty meters. Their footprints will probably last for millions of years."

### 2.6 EASEP: me
- **Role:** the first scientific station left on the Moon by people.
- **Facts `[LM]`:**
  - Mass **48 kg**. Two solar panels (it could only operate in **lunar daylight**), antenna and communications system, **passive seismometer**, **lunar dust detector**, an isotope heater, and a cylindrical antenna mast with a positioning mechanism. Panels face east and west.
  - **Seismometer:** measures seismic activity and the physical properties of the Moon's crust and interior.
  - **Dust detector:** measures dust accumulation and radiation damage to solar cells.
  - **Laser ranging retroreflector (LRRR):** counted as part of EASEP but not attached; needs no power; placed about **5 m NNW** of me. `[BG]` Scientists on Earth can bounce laser pulses off it to measure the Earth-Moon distance. *Verify before publishing.*
  - Commands received at **2119 MHz**, telemetry sent at **2276.5 MHz**.
  - Deployed about **17 m south** of the lander at 0.6735° N, 23.4730° E; switched on 21 Jul 1969, 04:40:39 UT while the astronauts were still outside.
  - Forerunner of the ALSEP packages of later Apollo missions. In the few hours available, there was little time for more science; more extensive studies came on later Apollo missions `[LM][A11]`.
- **Contribution:** first seismic and dust measurements from a human-deployed station on the Moon; proved the concept used by later, larger science stations.
- **Narration A2-06:**
  > "And me. I am a small station of forty-eight kilograms, built to listen. My seismometer feels the Moon's tiny tremors and tells Earth about its crust and interior. My dust detector tracks how dust settles and how radiation wears on solar cells. Near me sits a mirror that needs no power at all, a retroreflector for laser light. I am the first of my kind, and the later, bigger stations followed me."

### 2.7 Closing card (Act 2)
- All ghosts fade in a line (rocket, Columbia, Eagle upper, Eagle lower, EASEP) against the stars.
- **Narration A2-07:**
  > "A rocket, an orbiter, a lander and a little listener. Four kinds of machines, one journey: the first people on the Moon, and home again."
- Transition into Act 3 with the starfield sliding sideways and a thin horizontal timeline line drawing across the screen.

---

## 8. ACT 3: TIMELINE (start to shutdown)

**Goal:** a clear chronological recap, interactive. The narrator "plays back" its memory.

- **UI:** a horizontal timeline bar across the bottom with markers for each event in section 13 (`timeline[]`). The playhead advances automatically, pausing on each marker for the narration `line`. The user can click/drag/arrow-key to any marker. Show the date/time, a one-line title, and which machine it belongs to (color-coded chip: Saturn V, Columbia, Eagle upper, Eagle lower, EASEP).
- **Background:** the first-person Moon view stays, dimmed, with a **trajectory mini-diagram** overlay (Earth, Moon, path) that highlights the current phase `[CL]`. Add small icons for each machine on the diagram.
- **Moon vignettes:** while the narration `line` plays for a surface event, play a 5 to 8 s vignette in the first-person Moon scene (memory-ghost style, same translucent look as Act 2):

| Marker | Surface vignette |
|---|---|
| `landing` | Eagle's footpads settle at (0, 0, -17); small ballistic dust puff |
| `firstStep` | ghost astronaut on the ladder; first footprint decal appears; TV camera icon lights |
| `unload` | ghost astronaut carries the EASEP model from Eagle and sets it down at the origin; retroreflector placed |
| `surfaceWork` | ghost astronauts plant the flag, fill sample boxes; sample counter rises to 21.55 kg |
| `easepOn` | eyes flash; the signal icon lights; panels glow |
| `hatchClosed` | ghost astronauts climb the ladder; the hatch closes |
| `liftoff` | ascent stage lifts away; flag falls; lower half remains |
| `sunset` | sun sinks, 3 s of darkness, signal icon fades |
| `wake` | sun returns; signal icon relights |
| `shutdown` | cross-fade into Act 4 (Scene 4.4) |

  Events away from the Moon (launch, burns, docking, splashdown) stay on the trajectory mini-diagram.
- Every event in `timeline[]` is shown, in order. Do not skip any.
- Two real quotes are used here (see `line` fields for `undock` and `landing`). Keep them exactly as given.
- End of Act 3: playhead reaches the last marker (27 Aug 1969), the HUD dims, and the scene falls to dusk (Act 4).

---

## 9. ACT 4: GOODBYE (the day I stopped)

**Goal:** an emotional farewell. Still there, forever asleep. Ending: eyes close, system off, error message.

### Scene 4.1: Eagle leaves, the lower half stays
- **Stamp:** `21 JUL 1969 · 17:54:01 UT · LIFTOFF` `[LM]`
- **Visual:** the upper half lifts away (dust/regolith particles fly in ballistic arcs, **no sound**), the flag falls `[A11]`, the lower half remains on its legs 17 m away.
- **Narration A4-01:**
  > "Eagle's upper half lit its engine and rose without me. The lower half stayed, her legs planted, a launch pad that would never launch again. The flag fell over in the blast. Far above, Eagle met Columbia, and the samples went aboard. Later they cast her away into lunar orbit. I will never know where she ended."

### Scene 4.2: News from home
- **Stamp:** `24 JUL 1969 · 16:50:35 UT · SPLASHDOWN` `[CSM]`
- Camera looks up at Earth. Subtle signal pulses.
- **Narration A4-02:**
  > "Through the signals I learned the news: Columbia had come down in the Pacific Ocean. All three humans were home safe. I was glad. Now it was only me and the long lunar day."

### MOON CHAPTER B: The long days alone (Scenes 4.2A and 4.2B)

**Purpose:** give the narrator's 37 days on the Moon a storyline, using only what the sources support: sunlight, shadow, listening, signals from Earth, and silence. Do **not** invent events (see rule 7 in section 2).

#### Scene 4.2A: The first long day
- **Stamp:** `21 JUL to 3 AUG 1969 · DAY 1 ... DAY 14` (HUD day counter counting from the landing on 20 Jul `[CL]`; the first lunar day ended about two weeks later `[LM]`)
- **Visual:** time-lapse (about 25 s): the sun arcs across the black sky; the long shadow of Eagle's lower half sweeps over the ground like the hand of a clock `[CL]`; Earth hangs almost motionless in the sky `[BG]`; the signal icon pulses on a steady rhythm; fine dust settles on the sensor lens (a soft overlay) `[CL]`.
- **Narration A4-02A:**
  > "The days passed slowly. The sun climbed over the plain, and the shadow of Eagle's lower half swept across the ground like the hand of a clock. Earth hung almost still in the black sky, a small blue lamp that never set. I listened with my seismometer for the Moon's quiet tremors, I felt the dust settle on my sensor, and each day I sent what I had heard back to Earth. Nobody visited me. I was not lonely. I had work."

#### Scene 4.2B: Letters from home
- **Stamp:** `ONGOING · UPLINK 2119 MHz · TELEMETRY 2276.5 MHz` `[LM]`
- **Visual:** at intervals, a pulse travels from the Earth icon to the camera (uplink) and a pulse returns (telemetry); the sun sinks lower; shadows lengthen toward the east; the light turns amber `[CL]`.
- **Narration A4-02B:**
  > "Now and then a command came up from Earth, a few steady pulses on the frequency I listen to, and I answered every one. Those pulses were my letters from home. As the afternoon turned to evening, the shadows grew long again, and I understood that the night was coming."
- Continues into Scene 4.3.

### Scene 4.3: The first night
- **Stamp:** `3 AUG 1969 · 10:58:46 UT · TRANSMISSION STOPPED BY GROUND COMMAND` `[LM]`
- The sun sinks (accelerate the day/night cycle), shadows stretch, panels lose power as predicted `[LM]`. The signal icon fades. The screen goes dark for 3 s, then the sun returns.
- **Narration A4-03:**
  > "Sunset was coming. The panels could not feed me in the dark, so Earth told me to rest, about five hours before the night. I slept in the cold. And when the sun came back, I woke again, to listen once more."

### Scene 4.4: The last day
- Sun high (lunar noon, second lunar day). Heat shimmer-style visual distortion on the HUD only `[CL]` (no atmosphere, so **no heat haze on the world**).
- **Stamp:** `27 AUG 1969 · NEAR LUNAR NOON · COMMANDS NO LONGER ACCEPTED` `[LM]`
- **Narration A4-04:**
  > "I worked through heat thirty degrees hotter than I was built for, and I never complained. Then, near the noon of my second day, Earth called, and I could not answer. The commands no longer reached me. My work was done."

### Scene 4.5: Goodnight (eyes close, system off)
- **Camera:** slowly turn (yaw about 90°) to face Eagle's lower half one last time, then pitch up to Earth.
- **Narration A4-05 (slow, with pauses):**
  > "Do not be sad for me. I did what I was sent here to do. I am still here, on the plain beside Eagle's lower half, under the black sky. The footprints will outlast us all. Goodnight, Earth. Remember us."
- **Shutdown sequence (strict order):**
  1. Narration ends. Pause 1.5 s.
  2. **Eyelids close slowly** over about 6 s, with blur and vignette. Internal hum drops in pitch and fades.
  3. HUD flickers (3 to 4 flickers), signal icon goes dead.
  4. Full black for 1.5 s.
  5. A monospaced **error message** types out on black (about 40 ms per character), see below.
  6. Hold the error on screen for at least 8 s. **Do not auto-restart.**
  7. Fade in the **epilogue card** (below), then show a small `Replay` button.

**Error message (use exactly, adjust only for the starter's font):**
```
> UPLINK 2119 MHz ........ NO RESPONSE
> TELEMETRY 2276.5 MHz ... NO SIGNAL
> ERR_0827: COMMAND NOT ACKNOWLEDGED
> LAST CONTACT: 1969-08-27
> STATUS: EASEP (APOLLO 11) HALTED
> SYSTEM OFF
```

**Epilogue card (fades in after the error, non-narrated):**
```
EASEP · Apollo 11 · Sea of Tranquility
0.6735° N, 23.4730° E
Operated 21 Jul to 27 Aug 1969 (two lunar days)
Left on the Moon.
```

---

## 10. World and scene specification

**Units:** 1 three.js unit = 1 m. **Axes:** north = `-Z`, east = `+X`, up = `+Y`. EASEP and the camera sit at the origin, facing north at start.

| Object | Position (x, y, z) | Notes |
|---|---|---|
| EASEP (camera base) | (0, 0, 0) | Camera at mast, y = 0.8 `[CL]`. Panels east (+X) and west (-X) `[LM]`. |
| Eagle descent stage | (0, 0, -17) | 17 m north of EASEP `[LM]`. Four legs, footpad span 9.4 m, bottom 1.5 m above ground, stage 4.2 m wide, 1.7 m thick. |
| Eagle ascent stage | on top of descent stage | ~2.8 m high, 4.0 x 4.3 m. Removed at liftoff (Scene 4.1). |
| Ladder/egress | on the leg facing south (toward camera) `[CL]` | Source does not say which leg; chosen so the viewer sees the climb. |
| LRRR (retroreflector) | (-1.9, 0, -4.6) | 5 m NNW of EASEP `[LM]`. |
| Lunar surface TV camera, solar wind experiment, flag | near Eagle, between Eagle and EASEP `[CL]` | Positions are from the [A11] photo captions (relative only). |
| Memorial packet | at the base of the ladder `[CL]` | Placed in Scene 1.2. |
| Footprints | from ladder fanning toward EASEP area (decals) `[CL]` | Total traverse about 250 m, up to ~100 m from the lander `[LM]`. |
| Earth | high in the southern sky, about 12° above the view when turned `[CL]` | Small blue sphere, not to true scale. |

**Lighting / look**
- No atmosphere: pure black sky, hard directional sun, **long shadows** at start (low sun, near the terminator `[A11]`), rising over Acts 3 to 4. No fog, no haze, no blue sky.
- Ground: large plane (at least 400 x 400 m), noise displacement, gray regolith material, soft craterlets, scattered rocks (instanced).
- Stars: `Points` field, dim, static.
- Model strategy: **procedural, low-poly** meshes built from the dimensions above (no external copyrighted assets). Ghost/hologram shader (fresnel + scanline) for Act 2 memory models.
- Keep the first scene light: target 60 fps desktop, 30+ fps mid-range mobile. Cap pixel ratio at 2. Dispose geometries/materials/textures on act changes.

---

## 11. Eyes, HUD, audio and effects

**Eyelids (DOM overlay over the canvas):**
- Two absolutely positioned divs (top/bottom), animated with CSS transforms/clip-path; a `filter: blur()` on the canvas from 20px to 0 during opening. Reverse for closing.
- Provide `prefers-reduced-motion` fallback: simple fade instead of blur/flicker.
- **Memory mode (Moon Chapter A):** eyelids held about 85% closed with partial transparency and an orange-red tint, so the world is visible faintly through them; a gentle breathing pulse on the opacity. Entering/leaving memory mode uses a slow blink.

**HUD:**
- Top-left: date/time stamp (UT), updates per scene. Top-right: signal icon (pulses while alive).
- Bottom: subtitles (always on by default, ARIA live region), plus the Act 3 timeline bar.
- Font: monospace for the HUD, calm sans for subtitles (use the starter's fonts if defined).

**Audio (optional, off until the user clicks, due to browser autoplay rules):**
- Layers: soft internal hum (loopable), quiet telemetry ticks tied to the signal pulse, radio-static whisper in Act 4, pitch-down and fade at shutdown.
- Narration: provide subtitles at minimum; optionally Web Speech API TTS or pre-recorded clips if the team supplies them. Keep audio behind a simple `audio.enabled` config flag.

**Particles:** only for liftoff dust (ballistic, no drag, no billowing) `[CL]`.

---

## 12. Implementation plan (suggested modules; adapt to the starter's structure)

```
src/story/
  storyData.js        // section 13 data (parts, timeline, coordinates, narration IDs)
  StoryDirector.js    // state machine, scene sequencing, pause/resume/skip, ?act= support
  CameraRig.js        // first-person rig: fixed position, yaw/pitch tweens, free-look clamp
  EyeOverlay.js       // eyelid open/close, blur, flicker, reduced-motion fallback
  Hud.js              // timestamps, subtitles, spec cards, signal icon
  Timeline.js         // Act 3 bar + trajectory mini-diagram
  ShutdownEffect.js   // closing sequence + typed error + epilogue + replay
src/world/
  Moon.js  Sky.js  Lighting.js
  models/ Eagle.js  Columbia.js  Easep.js  SaturnV.js  Astronaut.js  Props.js
```

**Rules**
- Moon Chapter A (scenes 1.6 to 1.11) and Moon Chapter B (scenes 4.2A and 4.2B) are separate scene scripts (e.g. `src/story/MoonChapter.js`) driven by `moonChapter` in section 13; each scene needs a stamp, camera behavior, lighting, props, a narration ID and a duration.
- Director API (minimum): `start()`, `pause()`, `resume()`, `next()`, `prev()`, `goToAct(n)`, `goToEvent(id)`, `replay()`.
- Beats are declared as data (id, duration, camera keyframes, HUD stamp, narration id) and executed by the director. Narration display time = max(text length based estimate, audio duration).
- Astronaut animation: two low-poly humanoids with simple keyframes (ladder climb). Real timing is compressed `[CL]`.
- Provide `?debug` overlay with FPS, current beat, jump buttons.
- Write a short `README` section: how to run, how to jump to an act, how to edit story data.
- Write `DECISIONS.md` for every assumption you made (see section 15).

---

## 13. Data appendix (single source of truth)

```json
{
  "meta": {
    "title": "Last Light of EASEP",
    "narrator": "EASEP",
    "location": "Mare Tranquillitatis (Sea of Tranquility), Moon",
    "easepCoords": { "lat": 0.6735, "lon": 23.4730 },
    "landingCoords": { "lat": 0.67416, "lon": 23.47314 }
  },
  "parts": [
    { "id": "saturnV", "name": "Saturn V / S-IVB", "role": "launch vehicle", "src": "CSM,A11" },
    { "id": "columbia", "name": "Columbia (CSM-107)", "role": "orbiter", "massKg": 28801, "cmMassKg": 5557, "smMassKg": 23244, "engineN": 91000, "src": "CSM" },
    { "id": "eagleAscent", "name": "Eagle ascent stage", "role": "crew cabin + return vehicle", "dryMassKg": 2445, "propellantKg": 2376, "engineN": 15000, "cabinM3": 6.65, "src": "LM" },
    { "id": "eagleDescent", "name": "Eagle descent stage", "role": "lander + launch pad", "dryMassKg": 2034, "propellantKg": 8248, "engineN": 45000, "widthM": 4.2, "thicknessM": 1.7, "footpadSpanM": 9.4, "clearanceM": 1.5, "src": "LM" },
    { "id": "easep", "name": "EASEP", "role": "surface science station", "massKg": 48, "uplinkMHz": 2119, "downlinkMHz": 2276.5, "instruments": ["passive seismometer", "lunar dust detector", "laser ranging retroreflector (unpowered)"], "src": "LM" }
  ],
  "moonChapter": {
    "a_flashback": [
      { "id": "1.6", "title": "Powered descent, felt in the dark", "stamp": "MEMORY · 1969-07-20 20:05 UT", "narration": "A1-06", "src": "LM" },
      { "id": "1.7", "title": "Touchdown", "stamp": "MEMORY · 1969-07-20 20:17:40 UT", "narration": "A1-07", "src": "LM" },
      { "id": "1.8", "title": "The waiting and the first steps", "stamp": "MEMORY · 1969-07-21 02:56:15 UT", "narration": "A1-08", "src": "LM,A11" },
      { "id": "1.9", "title": "Unloaded and set down", "stamp": "MEMORY · 1969-07-21", "approx": true, "narration": "A1-09", "src": "LM,A11" },
      { "id": "1.10", "title": "While I slept, they worked", "stamp": "MEMORY · 1969-07-21", "approx": true, "narration": "A1-10", "src": "LM,A11" },
      { "id": "1.11", "title": "Back to the present", "stamp": "1969-07-21 05:11:13 UT", "narration": "A1-11", "src": "LM" }
    ],
    "b_aloneDays": [
      { "id": "4.2A", "title": "The first long day", "stamp": "1969-07-21 to 1969-08-03", "narration": "A4-02A", "src": "LM,CL" },
      { "id": "4.2B", "title": "Letters from home", "stamp": "ongoing", "narration": "A4-02B", "src": "LM,CL" }
    ]
  },
  "timeline": [
    { "id": "launch", "utc": "1969-07-16T13:32:00Z", "machine": "saturnV", "title": "Liftoff from Pad A, Kennedy Space Center", "src": "CSM,A11",
      "line": "Everything I would ever be began with a roar I could only feel, from the dark inside Eagle's belly." },
    { "id": "parking", "utc": "1969-07-16T13:43:00Z", "approx": true, "machine": "saturnV", "title": "Earth parking orbit (about 11 min after liftoff)", "src": "A11",
      "line": "We circled the Earth, one and a half times, quietly gathering ourselves." },
    { "id": "tli", "utc": "1969-07-16T16:16:16Z", "machine": "saturnV", "title": "Translunar injection burn (5 min 48 s)", "src": "CSM",
      "line": "The last stage fired again, and the Moon became our road." },
    { "id": "dock", "utc": "1969-07-16T16:56:03Z", "machine": "columbia", "title": "Columbia docks with Eagle; S-IVB sent into solar orbit", "src": "CSM",
      "line": "Columbia turned around and joined with Eagle. After that, the empty rocket was set free." },
    { "id": "coast", "utc": "1969-07-17T00:00:00Z", "approx": true, "machine": "columbia", "title": "Coast to the Moon: mid-course burn and color TV", "src": "CSM",
      "line": "Three days of coasting. A short burn kept us on course, and Earth saw us in color." },
    { "id": "loi", "utc": "1969-07-19T17:21:50Z", "machine": "columbia", "title": "Lunar orbit insertion (357.5 s) behind the Moon; later 17 s circularizing burn", "src": "CSM",
      "line": "Columbia slowed us down behind the Moon, where no signal could reach us, and the Moon caught us." },
    { "id": "undock", "utc": "1969-07-20T17:44:00Z", "machine": "eagleAscent", "title": "Eagle undocks from Columbia", "src": "CSM,LM,A11",
      "line": "Collins let Eagle go with a friendly message: \"You cats take it easy on the lunar surface.\"" },
    { "id": "descentOrbit", "utc": "1969-07-20T19:08:00Z", "machine": "eagleDescent", "title": "30 s descent-orbit burn (closest approach 14.5 km)", "src": "LM",
      "line": "A short burn lowered Eagle to fourteen and a half kilometers above the surface." },
    { "id": "poweredDescent", "utc": "1969-07-20T20:05:00Z", "machine": "eagleDescent", "title": "Powered descent begins (756.3 s)", "src": "LM",
      "line": "The big engine throttled down and we fell toward the plain for almost thirteen minutes." },
    { "id": "landing", "utc": "1969-07-20T20:17:40Z", "machine": "eagleDescent", "title": "Landing in the Sea of Tranquility", "src": "LM,A11",
      "line": "Then the words went out to the world: \"The Eagle has landed.\"" },
    { "id": "firstStep", "utc": "1969-07-21T02:56:15Z", "machine": "eagleDescent", "title": "First human steps on the Moon; Aldrin follows about 15 to 19 min later", "src": "LM,A11",
      "line": "The hatch opened, and a human stood on the Moon for the first time, while millions watched." },
    { "id": "unload", "utc": "1969-07-21T03:00:00Z", "approx": true, "machine": "easep", "title": "EASEP unloaded from Eagle's stowage bay and set down 17 m south; retroreflector placed about 5 m from it", "src": "LM,A11",
      "line": "A gloved hand opened my storage bay, and light poured in for the first time." },
    { "id": "surfaceWork", "utc": "1969-07-21T03:30:00Z", "approx": true, "machine": "eagleDescent", "title": "Surface work: flag, 21.55 kg of samples, TV camera, radio call with the U.S. President", "src": "LM,A11",
      "line": "While I slept, they planted a flag, gathered rocks and talked to Earth." },
    { "id": "easepOn", "utc": "1969-07-21T04:40:39Z", "machine": "easep", "title": "EASEP switched on by ground command", "src": "LM",
      "line": "And that is when my eyes opened." },
    { "id": "hatchClosed", "utc": "1969-07-21T05:11:13Z", "machine": "eagleAscent", "title": "Moonwalk ends; hatch closed (Armstrong back inside 05:09:32 UT)", "src": "LM",
      "line": "The humans went inside. The hatch closed. I was alone." },
    { "id": "liftoff", "utc": "1969-07-21T17:54:01Z", "machine": "eagleAscent", "title": "Eagle's upper half lifts off after 21 h 36 min on the surface", "src": "LM",
      "line": "Eagle's upper half rose and left her lower half behind." },
    { "id": "redock", "utc": "1969-07-21T21:34:00Z", "machine": "columbia", "title": "Eagle docks with Columbia; samples brought aboard", "src": "LM,A11",
      "line": "Up above, Eagle met Columbia, and the Moon rocks went aboard." },
    { "id": "jettison", "utc": "1969-07-22T00:01:01Z", "machine": "eagleAscent", "title": "Eagle's upper half jettisoned into lunar orbit (fate unknown)", "src": "LM",
      "line": "They cast Eagle's upper half away. Nobody knows where she finally ended." },
    { "id": "tei", "utc": "1969-07-22T04:54:42Z", "machine": "columbia", "title": "Transearth injection (2.5 min burn)", "src": "CSM",
      "line": "Columbia fired for two and a half minutes and pointed herself home." },
    { "id": "splashdown", "utc": "1969-07-24T16:50:35Z", "machine": "columbia", "title": "Splashdown in the Pacific (CM separated from SM 16:21:13 UT)", "src": "CSM",
      "line": "Columbia's capsule touched down in the Pacific. The humans were home." },
    { "id": "sunset", "utc": "1969-08-03T10:58:46Z", "machine": "easep", "title": "EASEP transmission stopped by ground command ~5 h before lunar sunset", "src": "LM",
      "line": "Before the long night, Earth told me to rest." },
    { "id": "wake", "utc": "1969-08-17T00:00:00Z", "approx": true, "machine": "easep", "title": "EASEP turned on again for the next lunar day", "src": "LM",
      "line": "The sun returned. I woke again and kept listening." },
    { "id": "shutdown", "utc": "1969-08-27T00:00:00Z", "approx": true, "machine": "easep", "title": "Near noon of the second lunar day: EASEP no longer accepts commands; experiment terminated", "src": "LM",
      "line": "On this day my work ended, and my station fell silent for good." }
  ]
}
```

> `approx: true` means the source gives the date/phase but not a precise UT time. Display as a date only (e.g., "17 JUL 1969"), never invent an exact time. For `wake`, the source says only "the next lunar day"; show "AUG 1969" without a day, or "NEXT LUNAR DAY". For `shutdown`, show "27 AUG 1969".

---

## 14. Known discrepancies between the sources (do not "fix" silently)

| Topic | Source A says | Source B says | Use in the project |
|---|---|---|---|
| Undock time | `[LM]/[CSM]`: 17:44:00 UT | `[A11]`: 1:47 p.m. EDT (that would be 17:47 UT) | **17:44:00 UT** (catalog pages); note `[A11]` differs by 3 min |
| Aldrin follows Armstrong out | `[LM]`: about 19 min later | `[A11]`: less than 15 min later | Say **"about 15 to 19 minutes later"** |
| Time outside / EVA length | `[LM]`: Aldrin back inside after 1 h 41 min; Armstrong ~12 min later at 05:09:32 UT; EVA ended 05:11:13 UT | `[A11]`: 2 h 32 min on the surface (2 h 15 for Aldrin) | Use the `[LM]` UT stamps for the HUD. Avoid quoting EVA durations on screen |
| Launch site | `[CSM]/[A11]`: Pad 39A / Pad A, Launch Complex 39, Kennedy Space Center | `[LM]` "Facts in Brief": Cape Canaveral | **Kennedy Space Center, Pad A (LC-39)** |
| Launch vehicle ID | `[CSM]` text: Saturn V "SA-504" | `[CSM]` alternate names list: "SA-506" | Say just **"Saturn V"** |
| Splashdown position | `[CSM]`: 13°19′N, 169°9′W, 400 miles SSW of Wake Island, 24 km from USS Hornet | `[A11]`: about 812 nautical miles southwest of Hawaii | Say just **"the Pacific Ocean"** |
| Landing site wording | `[LM]`: Sea of Tranquility | `[A11]`: southwestern Sea of Tranquility | **Sea of Tranquility** |

---

## 15. Acceptance checklist (definition of done)

**Story**
- [ ] The narrator is the EASEP, first person, throughout. No third-person narration of "the machine".
- [ ] Act 1: black → eyes open → **astronauts climb the ladder to the spaceship** → **camera turns to the other side** → hatch closes → origin memory.
- [ ] Act 2: all six cards present (Saturn V/S-IVB, Columbia, Eagle ascent, Eagle descent, surface kit, EASEP) plus the closing card. Each shows role, key facts and contribution.
- [ ] Act 3: every `timeline[]` event appears in order and is navigable. Start (launch) to shutdown (27 Aug 1969) both visible.
- [ ] Act 4: lander leaves, first night, last day, goodnight, **eyes close**, **system off**, **error message**, epilogue.
- [ ] The ending never auto-restarts; replay is user-initiated after the epilogue.
- [ ] **Moon storyline present:** Moon Chapter A (Scenes 1.6 to 1.11) plays after Scene 1.5 and returns to the present; Moon Chapter B (Scenes 4.2A and 4.2B) plays between Scenes 4.2 and 4.3.
- [ ] Act 3 plays a short Moon vignette for each surface event (table in section 8).
- [ ] Moon chapters contain no invented scientific results, visitors, dialogue or extra quotations.

**Fidelity**
- [ ] No mention of Mars as the location. No rover vehicle added.
- [ ] No sound for exterior events in vacuum.
- [ ] No quotes other than the two in the `timeline` data. No invented specs, results, or dates.
- [ ] Approximate dates are shown as dates only (see section 13 note).
- [ ] `[BG]` items (retroreflector purpose) flagged for team verification in `DECISIONS.md`.

**Technical**
- [ ] The starter app's structure and style are preserved; story code lives in new modules.
- [ ] Story text and numbers come from `storyData.js`, not hard-coded in render code.
- [ ] Works on desktop and mobile; resize-safe; 60 fps desktop target; resources disposed between acts.
- [ ] Pause/resume, previous/next, skip to act, subtitles toggle, mute, replay all work.
- [ ] Reduced-motion fallback implemented; subtitles accessible (ARIA live region).
- [ ] `DECISIONS.md` lists every assumption (camera height, ladder side, Earth placement, compressed timings, audio approach).
- [ ] README explains how to run, jump to an act (`?act=1..4`), and edit story data.

---

## 16. Optional: alternate narrator (only if the team prefers a different machine)

If the team wants the **lander** to narrate instead:
- **Narrator:** Eagle (LM-5). "Eyes" = the two triangular windows `[LM]`.
- **Act 1:** Eagle wakes on 20 Jul as the crew enters through the top docking hatch for final checkout `[CSM]` (astronauts moving up into the cabin), then turns to look out of the other window toward the Moon below.
- **Act 4 ending:** Eagle's upper half is jettisoned at **22 Jul 1969, 00:01:01 UT** `[LM]`; eyes close as Columbia drifts away; error message; epilogue notes that the **descent stage remains on the Moon** `[LM][TEAM]` and the upper half's fate is unknown.
- Acts 2 and 3 stay the same, with the narrator and "me/my" references swapped accordingly.
