# Fun checklist

Run this on every episode before a pull request. Play it on a phone, with sound on.
A "no" is a bug: fix it or write down why not.

- [ ] **Pace:** the child does something (tap, drag, steer, choose, find, time) at least every 30 to 60 seconds.
- [ ] **Text:** never more than 2 short lines on screen at once. Show, don't tell.
- [ ] **Life:** every page has motion and sound. No static screens.
- [ ] **Payoff:** every action gets an instant answer: animation, sound, a sound-effect word, the machine reacting.
- [ ] **Failure is funny,** never a punishment. Retry is instant and the machine cheers the child on.
- [ ] **Easy start:** the first play moment can be won in under 20 seconds.
- [ ] **Scale to the child:** sizes, speeds and times are compared to things they know (a school desk, a tortoise, a bus ride).
- [ ] **One wow moment** a child would tell a friend about. Name it:
- [ ] **One emotional beat** that makes them feel something. Name it:
- [ ] **No dead ends:** Skip and Next always work.
- [ ] **Real numbers are game numbers:** the real value is the goal, the limit or the score.
- [ ] **True:** every spoken line has a fact id; `npm run check:facts` shows no errors and no `TODO-VERIFY`.
- [ ] **Three languages:** English complete; Sinhala and Tamil reviewed by a speaker.

## Sojourner, 14 Nov 2026

| Rule | Result |
|---|---|
| Pace | Pass. Longest stretch without input is the landing, about 12 seconds |
| Text | Pass at 1280 x 720. Not checked at phone width: `p1.bounce`, `p7.quiet` and `p7.backup` are the longest lines and may need shortening |
| Life | Pass. Camera always drifting, dust in the air, sound on every step |
| Payoff | Pass. Each game action answers with a sound, a word or sparks |
| Failure is funny | Pass. BONK! into a rock and straight back to planning |
| Easy start | Pass. One tap and SEND wins the first game; the signal wait is 4 seconds |
| Scale to the child | Pass. "Smaller than you", a five-storey building |
| Wow | The airbag ball bouncing in; sending a command and waiting for it to cross space |
| Emotional beat | "Hello? … Earth? … Can anybody hear me?" at dusk |
| No dead ends | Pass. Skip leaves any game or page |
| Real numbers | Pass. About 10 minutes of delay, 7 planned days against 83, about 15 bounces |
| True | Pass. 19 facts, all from the challenge resources (Pathfinder mission page, NSSDCA) |
| Three languages | **Fail.** English only; Sinhala and Tamil episode text not written |

Not checked on a real phone yet. The voice is the browser's text-to-speech until we record our own.

## Apollo 11 / EASEP, 14 Nov 2026

| Rule | Result |
|---|---|
| Pace | **Needs work.** Act 1 has a long narrated runway before the deployment game, and Act 2 is six read-through cards. Add a brief interaction just after wake-up and a player action on selected machine cards, keeping a meaningful action within 30–60 seconds. |
| Text | **Needs review.** Several narration lines are longer than two short lines on a phone. Split long narration into short, source-linked beats and check the smallest supported viewport before release. |
| Life | Pass on desktop: eye, camera, astronaut, surface, timeline, card-entry, night and shutdown motion accompany narration. Phone playback is not checked. |
| Payoff | Pass: deployment responds with placement feedback; timeline markers update the scene and narration; the ending shows shutdown and patch payoff. |
| Failure is funny | Pass for deployment: incorrect placement/heading gives an immediate retry message. Other acts have no fail state. |
| Easy start | Pass for the deployment game itself: its two sliders and confirm can be completed in under 20 seconds. The story reaches it later than ideal. |
| Scale to the child | **Needs work.** Terms such as uplink, telemetry, and MHz are not explained in child-sized language. Add short plain-language labels beside the technical facts. |
| Wow | Eyes open on the Moon, then the powered-descent memory is replayed from the stationary EASEP's point of view. |
| Emotional beat | EASEP's last "Goodnight, Earth" followed by the unacknowledged-command error and its silent memorial. |
| No dead ends | Pass: the player Skip remains available; timeline has previous/next controls and a completion action. |
| Real numbers | Pass: deployment uses the approximately 17 m distance; mass, radio frequencies and mission events are sourced facts. |
| True | Pass: `npm run check:facts` reports 25 Apollo facts, zero errors and zero warnings. |
| Three languages | **Fail for this expansion.** New Apollo narration and timeline strings are English-only; Sinhala and Tamil speakers must translate/review before release. |

Not tested on a phone or with Sinhala/Tamil speakers. This is a desktop smoke-test result, not a release sign-off.

## Viking 1 & 2, 14 Nov 2026

| Rule | Result |
|---|---|
| Pace | Pass. A press, a drag, a hold or a tap on every page |
| Text | Pass at 1280 x 720; not checked at phone width |
| Life | Pass. Two launches, a cruise, an orbit, a full descent with parachute and engines |
| Payoff | Pass. Sound-effect words and sounds on each step |
| Failure is funny | Pass. Parachute too early or too late: "Whoops!", straight back to the top |
| Easy start | Pass. The first play moment is one button: "Launch Viking 1!" |
| Scale to the child | Partly. Real numbers (6 km, 250 to 60 m/s, 19 minutes) but few everyday comparisons |
| Wow | Landing Viking 1 yourself: parachute at 6 km, drop the shield, fire the engines |
| Emotional beat | The timeline: the four machines go silent one by one and the lander's light goes out |
| No dead ends | Pass. Skip works on every page and game |
| Real numbers | Pass. 6 km, 250 to 60 m/s, 19 minutes, 52,663 images, the real shutdown dates |
| True | Pass. 30 facts from the Viking 1 challenge page, the brief's NASA pages and NSSDCA |
| Three languages | **Fail.** English only |
