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
| Scale to the child | Pass. Microwave oven, tortoise, four-storey building |
| Wow | The airbag ball bouncing in; sending a command and waiting for it to cross space |
| Emotional beat | "Hello? … Earth? … Can anybody hear me?" under the blue sunset |
| No dead ends | Pass. Skip leaves any game or page |
| Real numbers | Pass. 11 minutes of delay, 7 planned days against 83, 15 bounces |
| True | Pass. 22 facts, all with NASA or HiRISE sources |
| Three languages | **Fail.** English only; Sinhala and Tamil episode text not written |

Not checked on a real phone yet. The voice is the browser's text-to-speech until we record our own.
