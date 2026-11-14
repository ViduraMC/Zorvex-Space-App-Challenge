# The Abandoned Explorers: pitch notes

*Abandoned but not Forgotten.* Team Zorvex, NASA Space Apps Challenge 2026, Kandy.
Challenge: "Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the
Moon and Mars". Judging: Impact, Creativity, Validity, Relevance, Presentation.
Pitch limit: 7 slides including the title, or a 30-second video (see `SUBMISSION.md`).

## 1. Problem

Since the 1960s NASA has left rovers, landers, descent stages and instruments on the Moon and
Mars. School-age space fans hear mostly about active missions. The machines that stayed behind
are documented in dense, English-only technical pages. No tool lets a child see how each part
worked, what science it made possible, or learn it in their own language.

The challenge says it too: school-age enthusiasts "often hear only about active, ongoing
missions", and learners "work through dense technical websites or historical textbooks that
lack the spark of imagination".

## 2. Why it is a real problem

| Barrier | What we found |
|---|---|
| Sources are written for experts | NASA's catalogue pages (NSSDCA) list UT times, MHz and kilograms |
| Existing tools show active missions, one museum object, or raw data | See section 4 |
| Hardware is shown as one object | Nobody explains each part and the science it unlocked, which is what the challenge asks for |
| Language | NASA's children's site is English and Spanish only. In Sri Lanka about 87% speak Sinhala and 28.5% Tamil (2012 census, age 10+) |
| Access | One planetarium in the whole country (Colombo, since 1965). Schools have no specialist space teachers, and interest fades with age (UN/IAF 2023 study) |
| Passive learning | Reading and watching, not doing. Stories help most when a learner knows little about a topic (Learning Scientists, 2024) |

## 3. Who it is for

- **Children aged 8 to 14** in Sinhala, Tamil and English medium schools (primary).
- **Teachers** without space training, and **parents** (secondary).
- **Older students and curious adults**: the chatbot goes deeper (tertiary).

What the problem costs them: a teacher's hours turning NASA pages into a lesson; a trip to
Colombo or a museum abroad; interest that is never sparked. Our app costs nothing and runs on
any phone or laptop browser, with no login.

## 4. What exists, and the gap

| Existing | Good at | Missing |
|---|---|---|
| NASA Eyes on the Solar System | 3D, time travel, active missions | No story for children, no part-by-part view, English only |
| NASA Space Place | Children's articles and games | Not about the hardware left behind; no Sinhala or Tamil |
| Smithsonian 3D (Apollo 11 Command Module) | One scanned museum object | No story, no play, no link to the science |
| NASA "Human Artifacts on the Moon", LROC maps | Catalogues, orbit photos | Technical, for adults |
| NSSDCA catalogue | The facts | Dense, for experts |

## 5. Our solution

An interactive 3D web experience. The child launches a rocket, chooses the Moon or Mars, lands,
and finds the explorers left there standing on memorial plinths. Each one tells its own story
and the child **plays its real mission**.

What makes it unique:

1. **The machine tells its own story**, in first person, with voices.
2. **Play the real mission.** Real NASA numbers are the game rules: wait out Viking's 19-minute
   signal, land Intrepid 180 m from Surveyor 3, count ALSEP's 68,928 hours on the Moon.
3. **Anatomy 360°.** Turn each machine all the way round; tap every part to see what it is, what
   it did, and the science it made possible.
4. **Talk to the machine.** An AI chatbot that answers as that machine, only from verified NASA
   facts, and shows the source.
5. **English, Sinhala and Tamil** in full.
6. **Every fact links to its NASA page.** Nothing invented.
7. **Free, in the browser, on a phone.** No install, no account.

## 6. How it works

Home on Earth at night → first-person take-off → choose Moon or Mars → landing → explorers on
memorial plinths → hologram panel (summary, landing site on a globe, sources) → the story
(chapters, mini-games, voices) → Anatomy 360° → talk to the machine → mission patch and "Look up
tonight" (where Mars or the Moon is in your sky now).

Built with three.js on one canvas. Each story is data: a script, a facts file with a NASA source
for every fact, and a text file per language. A new machine or a new language needs no new code.

## 7. NASA data

- Challenge resources: NSSDCA catalogue pages, NASA mission pages (Viking, Pathfinder, InSight,
  Surveyor 3, Pioneer 10, Spirit and Opportunity, Ingenuity).
- NASA 3D Resources models: Saturn V, Apollo Lunar Module, Viking Lander, InSight, Opportunity,
  Ingenuity, Pioneer 10, crew escape suit.
- Real Viking images from Mars (first photo, Chryse panorama, Utopia colour view).
- Full list with links: `docs/RESOURCES.md` and the in-app Sources page.

## 8. Impact

| Who | What changes |
|---|---|
| Children | They learn what each machine did and how its parts worked, by doing it, in their own language |
| Teachers | A ready lesson with sources, in three languages |
| Parents | A free, safe, ad-free activity to do together |
| The wider world | Any team can add a machine or a language with data files only |

Proof: every fact is sourced and checked by `npm run check:facts`. After each story the machine
asks "Do you remember me?" (two or three questions) so we can see what children kept.

## 9. Against the judging criteria

| Criterion | Our answer |
|---|---|
| Impact | Free, three languages, aimed at children with the least access |
| Creativity | The machines speak, you play their real missions, you take them apart in 3D, you talk to them |
| Validity | Every fact traced to a NASA page; automatic fact check; nothing invented |
| Relevance | Exactly the challenge: left-behind hardware, school-age audience, the link between engineering and science, narrative not lists |
| Presentation | One cinematic flow from launch to memorial |

## 10. Sustainability

Runs on free hosting. New stories and languages are data files, so schools, the planetarium's
mobile outreach, science NGOs and museums can reuse and extend it. Open source (MIT).

## Sources for these claims

- Challenge: <https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/>
- NASA Eyes: <https://science.nasa.gov/eyes/>
- NASA Space Place (English and Spanish): <https://www.jpl.nasa.gov/news/nasa-kids-web-site-en-espanol/>
- Smithsonian Apollo 11 3D: <https://www.smithsonianmag.com/smart-news/explore-apollo-11-3d-180959853/>
- NASA Human Artifacts on the Moon: <https://www.nasa.gov/wp-content/uploads/static/history/humanartifacts.html>
- LROC: <https://www.lroc.asu.edu>
- Sri Lanka 2012 census languages: <https://wikiwand.com/en/articles/Demographics_of_Sri_Lanka>
- Sri Lanka Planetarium: <https://www.yamu.lk/kamu/the-planetarium/>
- UN/IAF 2023, space education in Sri Lanka: <https://www.unoosa.org/documents/pdf/psa/activities/2023/UN-IAF2023/Presentations/Final_13-4_Dulani_Chamika_Withanage.pdf>
- Storytelling and learning: <https://learningscientists.org/blog/2024/6/6-1>

Check before the pitch: no published numbers exist for the time or money cost in Sri Lanka, so
keep those claims qualitative. Items 3 (Anatomy 360°), 4 (chatbot) and 5 (Sinhala, Tamil) of
"What makes it unique" are being built now; do not demo them until they are done.
