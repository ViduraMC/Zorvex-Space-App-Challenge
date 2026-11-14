# Viking 1 & Viking 2 — Three.js Mission Story Brief

**Purpose:** A research-grounded creative and technical brief for building an interactive Three.js experience that tells the complete life journey of NASA's Viking 1 and Viking 2 missions — from Earth launch, through orbital exploration and landing, to the final loss of contact and their lasting legacy.

**Story flow:** `START → JOURNEY → WORK ON MARS → DISCOVERIES → TIMELINE / SHUTDOWN → GOODBYE / LEGACY`

**Research basis:** The two NASA pages supplied by the team are the primary narrative sources. This brief also uses NASA's linked Viking 2 mission page, its detailed *Spacecraft and Science* page, NASA's Viking/astrobiology page, and NASA's image/3D-resource pages to fill in spacecraft engineering, instruments, dates and visual assets. All factual claims below are intended to be represented faithfully; the emotional language is a creative narration layer, not a claim that the spacecraft were conscious.

---

## 1. Instructions to the AI development agent

You are working inside an **existing application starter project**. Do not replace it with a new project or redesign its architecture without first inspecting what is already there.

1. Inspect the current repository, package file, routing, components, styles, assets, and existing Three.js setup.
2. Identify the existing entry point and extend the current implementation. Preserve working code, naming conventions, package versions, and current design decisions wherever possible.
3. Build the story as a polished, interactive 3D experience, not as a static article or a generic Mars landing animation.
4. Use the story sequence and verified facts in this document. Do not invent mission events, scientific discoveries, hardware, dates, dialogue, or operational status.
5. Use NASA visual references and the official lander GLB listed in Section 10. The NASA GLB is a **Viking lander model**; both landers were built to the same design, so it can represent either lander. It is not an orbiter model.
6. Build the orbiter from NASA's reference image and labelled technical drawing if a suitable ready-made 3D model is not already available in the project. Do not make it look like a modern rover or satellite with arbitrary parts.
7. Keep factual information and poetic narration visually distinguishable. Use concise on-screen facts, with optional longer explanations in expandable information panels.
8. Provide a clear loading state, graceful fallback if an image or model cannot load, responsive layouts, and usable controls on desktop and mobile.
9. Keep the experience performant. Avoid loading multiple unnecessary copies of large models or textures. Reuse or clone the same lander geometry for the twin craft where appropriate.
10. Add source credits to NASA images and models in an accessible Credits / Sources area and, where appropriate, beside the displayed media.
11. Do not use copyrighted music or sound recordings. If audio is added, use properly licensed/original ambient audio, make it optional, and provide captions or an equivalent text experience.
12. Before finishing, test all chapter navigation, timeline controls, hotspot interactions, model loading, mobile layout, and the final scene. Do not leave non-functional buttons or placeholder text.

### Core concept

The audience should feel that it is following two pioneering robotic explorers. The audience first sees the two spacecraft leave Earth as paired machines. It then learns that each pair had two jobs: an **orbiter** worked from space, while a **lander** descended to become a stationary science laboratory on the surface. The story follows the work of all four machines, their discoveries, and their separate shutdowns.

The main emotional idea is:

> They were built to work for about 90 days on another world. They worked far beyond that plan. Their signals eventually stopped, but their discoveries did not disappear. The two landers remain as silent witnesses on Mars, and the knowledge they sent home continues to guide exploration.

Use this idea as the emotional spine. Keep it respectful, quiet and reflective rather than melodramatic.

---

## 2. Historical orientation: what exactly were Viking 1 and Viking 2?

Viking was a NASA Mars exploration program consisting of **two spacecraft**: Viking 1 and Viking 2. Each spacecraft was a paired system:

- **Orbiter:** stayed in Mars orbit. It photographed and mapped the planet, studied the atmosphere, helped choose safe landing areas, and relayed communications between its lander and Earth.
- **Lander:** separated from the orbiter, descended to Mars, landed on three legs and operated as a stationary science station. It photographed the ground, collected soil with a robotic arm, analysed samples, and measured the weather and environment.

Therefore, the missions involved **four primary flight machines**: Viking 1 Orbiter, Viking 1 Lander, Viking 2 Orbiter and Viking 2 Lander. Do not describe Viking 1 and Viking 2 as only two satellites. The orbiters were the satellite-like machines; the landers were the surface laboratories.

The two orbiters returned **52,663 images** and mapped about **97% of Mars** at roughly **300-metre resolution**. Selected areas were imaged at much finer resolution. The two landers returned approximately **4,500 surface photographs**. These figures are among the most important facts to feature in the experience.

The mission objectives were to:

- Obtain high-resolution images of the Martian surface.
- Characterise the atmosphere and surface, including their composition and physical properties.
- Investigate weather and environmental conditions.
- Search for evidence of present or past microbial life.

Viking 1 achieved the first truly successful, long-lived U.S. landing on Mars. Be precise: the Soviet Mars 3 lander had made a survivable touchdown in 1971, but contact was lost seconds later. Do not claim that no spacecraft had ever touched Mars before Viking 1.

---

## 3. START — where the journey began

### Story beat

**Scene title:** “A world we could see, but had never truly reached.”

Before Viking, Mars had been observed through Earth telescopes and earlier spacecraft flybys and orbiters. Mariner 9 had revealed major features from orbit, but humanity still had not received a sustained, detailed view from a functioning surface laboratory. NASA wanted to move from looking at Mars from a distance to examining it directly.

Viking was designed to do more than take photographs. It carried an entire automated laboratory to another planet and attempted to answer one of humanity's largest questions: could Mars support life, or did it ever support life?

### Launch facts

| Event | Verified information |
|---|---|
| Launch site | Cape Canaveral, Florida, Launch Complex 41, United States |
| Launch vehicle | Titan IIIE-Centaur |
| Viking 1 launch | 20 August 1975, 21:22 UTC |
| Viking 2 launch | 9 September 1975, 18:39 UTC |
| Mission organisation | NASA, with major roles from Langley Research Center and Jet Propulsion Laboratory |

A useful historical detail for the opening: the spacecraft originally intended to launch first had a battery problem before launch. NASA switched the flight assignments. The spacecraft called **Viking-B** launched as Viking 1, while **Viking-A** launched later as Viking 2. Do not show a failed launch; the issue was discovered before launch and the mission proceeded successfully.

### Suggested visual direction

- Begin on Earth at night, then reveal Mars as a distant destination.
- Show the Titan IIIE-Centaur on the launch pad at Cape Canaveral. Use a NASA archival photograph or a historically plausible 1970s rocket model.
- Show each Viking orbiter with its lander enclosed beneath it in the protective aeroshell/bioshield assembly. The orbiter and lander should travel together during the cruise.
- Show two launch dates on a clear timeline rather than launching both on the same day.
- Include an unobtrusive fact panel: “Two spacecraft. Each one carried an orbiter and a lander.”

### Suggested opening narration

> In 1975, Mars was still a distant mystery. We could see its colour and its changing seasons, but we had never studied its surface through a long-running laboratory of our own. NASA sent two explorers across space. Each carried a partner: one to watch from orbit, and one to touch the ground. They were called Viking 1 and Viking 2.

---

## 4. JOURNEY — crossing space and reaching Mars

### Cruise phase

After launch, each spacecraft travelled from Earth toward Mars. The teams made course-correction manoeuvres to keep the spacecraft on the correct path. Viking 1's documented corrections occurred on 27 August 1975, 10 June 1976 and 15 June 1976.

The landers remained attached to their orbiters during the interplanetary journey. The orbiter provided the carrier structure and support; an electrical connection through the aeroshell supplied power to the lander during cruise.

### Arrival and orbital reconnaissance

- **Viking 1 entered Mars orbit on 19 June 1976.**
- **Viking 2 entered Mars orbit on 7 August 1976.**

The orbiters did not immediately release the landers into an unknown location. They first photographed the planet and helped mission planners assess possible landing sites. This is an important story beat: photographs from orbit showed that the initially selected landing areas were rougher than expected. Mission planners changed the sites to reduce landing risk.

- Viking 1's landing target was changed to the western slopes of **Chryse Planitia**, also called the Plains of Gold. It eventually landed about 28 kilometres from its planned target.
- Viking 2's site was changed to **Utopia Planitia**, near the edge of the polar region. It was selected after orbital images revealed rough terrain at the earlier proposed site.

### Suggested 3D sequence

1. Animate Earth receding and Mars growing larger. Use a symbolic travel path; do not imply that the journey took only a few seconds in real time.
2. Show course-correction burns as brief, labelled events on the timeline.
3. Show each orbiter slowing and entering Mars orbit.
4. Transition to an orbital view of Mars. Let the camera follow an orbiter as it scans the surface.
5. Highlight the two landing regions on a globe: Chryse Planitia for Viking 1 and Utopia Planitia for Viking 2.
6. Show the mission team choosing safer landing areas after reviewing orbital images.

---

## 5. HOW THE MACHINES WORKED — spacecraft anatomy and jobs

This section is essential. The experience should teach visitors what each major component did. Prefer interactive hotspots on 3D models, with a short label and an accessible explanation.

### 5A. The orbiter — the eyes and communications partner

**Physical appearance:** The orbiter was based on the Mariner spacecraft design. It had an octagonal central body, four solar-panel wings (eight panel sections in total), antennas, propulsion hardware and science instruments. It was approximately 2.5 metres across. Its solar panels supplied electrical power; NASA's detailed spacecraft page gives about 620 watts at Mars.

**Main responsibilities:**

- Carry the lander to Mars.
- Photograph possible landing sites and help certify safe areas.
- Remain in orbit after the lander separated.
- Carry out its own scientific observations.
- Relay lander data to Earth, allowing the lander to communicate through the orbiter as well as directly with Earth.

**Orbiter components and science instruments:**

| Component / instrument | What it did | Suggested hotspot explanation |
|---|---|---|
| Two-camera Visual Imaging Subsystem (VIS) | Took high-resolution images, helped assess landing sites, mapped geological features and photographed the planet and moons. | “The orbiters' eyes. They looked for safe places to land and revealed the shapes of the Martian surface.” |
| Infrared Thermal Mapper (IRTM) | Measured surface and atmospheric temperatures and reflected sunlight. | “A temperature map from orbit: it helped scientists understand how heat varied across Mars.” |
| Mars Atmospheric Water Detector (MAWD) | Measured atmospheric water vapour using infrared observations. | “It searched the thin Martian atmosphere for water vapour.” |
| Radio-science measurements | Used radio tracking and occultation to study spacecraft motion, Mars' gravity, atmospheric structure and other properties. | “Even the radio signal carried science. Changes in the signal helped reveal the planet and its atmosphere.” |
| High-gain dish antenna | Sent and received information over long distances. | “The long-distance link between Mars and Earth.” |
| UHF relay antenna / relay radio | Received lander transmissions and relayed them through the orbiter. | “A messenger in orbit, carrying the lander's reports toward Earth.” |
| Solar panels and batteries | Supplied electrical power to the orbiter and stored energy. | “Sunlight powered the orbiters.” |
| Propulsion system and attitude-control hardware | Adjusted the orbit and controlled spacecraft orientation. | “Small corrections kept the spacecraft in the right orbit and pointed in the right direction.” |
| Tape recorders | Stored information before transmission. | “When a direct transmission was not possible, data could be stored for later.” |

The orbiter's cameras mapped the entire planet at approximately 150–300 metres per pixel, with selected areas down to around 8 metres per pixel. NASA reports that Viking 1 Orbiter alone returned roughly 34,200 images.

### 5B. The lander — the laboratory on the ground

**Physical appearance:** Each lander was a stationary, six-sided aluminium platform supported by three legs. It had two panoramic cameras, an extendable robotic sampler arm, a meteorology boom, antennas, science equipment and two radioisotope thermoelectric generators (RTGs). It did **not** have wheels and did not drive around Mars.

**Power:** Each lander used two plutonium-238 RTGs. These converted heat from radioactive decay into electricity. The landers were not solar-powered. This was important because the landers needed reliable power through Martian seasons and changing sunlight conditions.

**Lander parts and instruments:**

| Component / instrument | What it did | Suggested hotspot explanation |
|---|---|---|
| Two panoramic cameras | Took 360-degree scans and photographs of the lander surroundings. | “The lander's eyes. They gave humanity its first detailed views from the surface of Mars.” |
| Robotic sampler arm and collector head | Reached into the soil, collected samples and delivered them to the onboard analysis instruments. It included a temperature sensor and magnets. | “A robotic hand reached into Martian soil and brought a sample into the laboratory.” |
| Gas Chromatograph–Mass Spectrometer (GCMS) | Analysed chemical compounds in soil samples, including searching for organic molecules. | “A chemical laboratory that looked for the ingredients and traces of carbon-based chemistry.” |
| Biological laboratory | Ran three automated experiments to test for possible microbial activity. | “Three experiments asked whether the soil behaved as though living microorganisms were present.” |
| X-ray fluorescence spectrometer | Analysed elemental composition of the soil. | “It helped identify what the Martian soil was made of.” |
| Weather / meteorology package | Measured temperature, wind direction and wind speed. | “It recorded the weather at the landing site.” |
| Pressure sensor | Measured atmospheric pressure near the lander. | “It measured how thin the Martian air was.” |
| Seismometer | Was intended to detect ground vibrations and possible marsquakes. | “A listener for movement beneath the ground.” Important accuracy note: Viking 1's seismometer was inoperable. Do not show Viking 1 recording successful marsquakes. |
| Magnets / magnetic test targets | Helped investigate magnetic properties of dust and surface particles. | “Magnets tested how much of the dust and soil was attracted to them.” |
| S-band high-gain and low-gain antennas | Supported direct communication between the lander and Earth. | “The lander could send its own reports home.” |
| UHF relay antenna | Sent data to the orbiter, which could forward it to Earth. | “When the orbiter passed overhead, it could carry the lander's message home.” |
| Two RTG power units | Generated electrical power from radioactive decay. | “A long-lasting power source that worked without sunlight.” |
| Landing legs and shock absorbers | Supported the lander and softened the shock of touchdown. | “Three legs helped the laboratory remain upright after landing.” |

### 5C. The aeroshell and landing system — surviving the descent

The lander could not simply fall through the Martian atmosphere. It travelled inside a protective entry system. The sequence should be represented as a series of engineering events:

1. **Separation:** The lander assembly separated from the orbiter near Mars.
2. **Atmospheric entry:** The protective aeroshell and heat-shield system protected the lander from intense heating during entry.
3. **Atmospheric measurements:** Sensors in the aeroshell measured aspects of the upper atmosphere during descent. These included a Retarding Potential Analyzer, an Upper-Atmosphere Mass Spectrometer, and pressure/temperature/density sensors.
4. **Parachute deployment:** A parachute slowed the lander after the initial high-speed entry.
5. **Terminal descent:** Retrorockets slowed the final descent before touchdown.
6. **Touchdown:** The lander settled onto its three legs. After landing, protective covers and deployment sequences allowed the cameras and sampler systems to begin surface operations.

**Important visual rule:** Do not show the orbiter landing. The orbiter remains in Mars orbit; only the lander descends to the surface. The orbiter later supports communications and its own orbital science.

### 5D. The three biology experiments — the search for life

Each lander carried three automated life-detection experiments. Explain them in plain language:

- **Labeled Release (LR):** Martian soil was given a nutrient solution containing radioactive carbon. The instrument watched for radioactive gas that could be released by microbial metabolism.
- **Gas Exchange (GEX):** Soil was exposed to a controlled gas environment and moisture. The instrument watched for changes in gases that might be caused by biological activity.
- **Pyrolytic Release (PR):** Soil was exposed to labelled carbon-containing gas under controlled conditions, including light. The instrument checked whether labelled carbon became incorporated into material that could indicate biological activity.

The reactions were unusual and scientifically important, but the results were **inconclusive**. They did not provide clear or definitive evidence that living microorganisms were present at either landing site. The GCMS also did not find detectable organic molecules in the tested soil at the sensitivity reported by NASA. The mission did **not** prove that Mars has never had life; it showed that these tests at these two sites did not establish its presence.

Do not simplify this into “Viking discovered life” or “Viking proved Mars has no life.” Both are incorrect.

---

## 6. WORK DONE — what each mission accomplished on Mars

### Viking 1: Chryse Planitia

**Landing:** 20 July 1976, at 22.483° north, 47.94° west (NASA mission-page coordinates). It landed on the western slopes of Chryse Planitia, the “Golden Plain.” It touched down about 28 kilometres from the planned target after orbital photographs showed the originally selected region was too rough.

**First moments:** Viking 1 was programmed to take an image about 25 seconds after touchdown. Its first photograph looked down toward a footpad and showed a solid but slightly rocky, dusty surface. It then produced colour images and a 300-degree panorama of the surrounding plain.

**Surface work:**

- Used its camera system to photograph the landscape.
- Extended its robotic sampler arm and collected its first soil samples on 28 July 1976.
- Delivered soil samples to the onboard biology and chemical-analysis instruments.
- Measured temperature, atmospheric pressure and wind conditions.
- Investigated the chemical and magnetic characteristics of the soil.
- Sent thousands of images and long-running environmental observations to Earth.

**Notable detail:** Viking 1's seismometer did not operate successfully. Be sure not to present it as a successful seismic discovery.

### Viking 2: Utopia Planitia

**Landing:** 3 September 1976, at 47.968° north, 225.71° west. It landed in Utopia Planitia, approximately 6,460 kilometres (4,000 miles) from Viking 1.

**Surface work:**

- Took panoramic photographs of a second, different Martian region.
- Collected soil samples on three occasions, beginning 12 September 1976.
- Conducted the same three biology experiments and chemical analysis as its twin.
- Measured weather and local surface conditions.
- Added a second location's results, allowing scientists to compare two very different landing environments.

**Notable detail:** Viking 2's landing site was rockier and flatter in appearance than Viking 1's. The lander came to rest tilted about 8.5 degrees to the west. Its terrain had fewer clear horizon features, making it harder to locate the lander precisely from orbital images.

### Why two landing sites mattered

The landers were about 6,460 kilometres apart. This gave scientists two local environments to compare instead of relying on a single patch of Mars. Both sites showed iron-rich, clay-like surface material and highly reactive soil chemistry, but the landers also observed local differences in terrain and environmental conditions.

---

## 7. SCIENTIFIC CONTRIBUTION — what humanity learned

Make the audience understand that the mission was successful even though it did not confirm life.

### Major contributions

1. **A new view of Mars:** The orbiters imaged 97% of the planet and returned 52,663 images. They revealed major volcanoes, lava plains, immense canyons, cratered highlands, wind-shaped features and channels consistent with ancient flowing water.
2. **A surface-level view:** The landers delivered more than 4,500 photographs, including the first images ever returned from the surface of Mars.
3. **Atmospheric science:** Viking measured atmospheric temperature, pressure, water vapour and other properties. It helped scientists understand the thin atmosphere and observe seasonal dust storms and atmospheric changes.
4. **Soil and chemistry:** The landers characterised the surface material as iron-rich, clay-like soil with strongly oxidising chemistry. NASA's astrobiology summary reports that wetting the material released oxygen and that no organic molecules were detected in the tested soil at the reported parts-per-billion level.
5. **Life-detection science:** Viking was the first NASA mission dedicated to searching for life on another planet. Its unexpected biological-test results showed how difficult it is to distinguish biological activity from non-biological chemistry. The mission continues to influence the way later missions design life-detection strategies and instruments.
6. **A landing blueprint:** Viking proved that a complex robotic laboratory could be delivered safely to the Martian surface and operate there for years. Its landing, communications and surface-science experience informed later Mars exploration.

### Science summary to display

> Viking did not find confirmed life. It did something equally important for science: it measured Mars directly, showed how complex its chemistry could be, and taught future explorers how carefully a search for life must be designed.

### Key statistics for visualisation

- 2 orbiters + 2 landers = 4 primary spacecraft elements.
- 52,663 orbital images.
- About 97% of Mars mapped.
- Around 4,500 lander images.
- Orbital map resolution: about 300 metres; selected areas to about 8 metres.
- Viking 1 and Viking 2 landers were designed for a nominal mission of about 90 days, but each worked much longer.
- Viking 1 lander worked for more than six years; Viking 2 lander worked for about 3.5 years.

---

## 8. TIMELINE — from launch to the last signal

Use an interactive timeline that can be scrubbed. Keep the dates visible and allow visitors to select Viking 1, Viking 2, or “Both missions.” Distinguish **orbiter shutdown** from **lander communication ending**.

| Date | Mission / machine | Event |
|---|---|---|
| 20 Aug 1975 | Viking 1 pair | Launched from Cape Canaveral aboard Titan IIIE-Centaur. |
| 9 Sep 1975 | Viking 2 pair | Launched from Cape Canaveral aboard Titan IIIE-Centaur. |
| 27 Aug 1975 | Viking 1 | First documented mid-course correction. |
| 10 Jun and 15 Jun 1976 | Viking 1 | Further course corrections before Mars arrival. |
| 19 Jun 1976 | Viking 1 Orbiter | Entered Mars orbit and began orbital reconnaissance. |
| 20 Jul 1976 | Viking 1 Lander | Separated and landed at Chryse Planitia — the first successful U.S. landing on Mars. |
| 20 Jul 1976 | Viking 1 Lander | Returned the first photograph from the surface of Mars, about 25 seconds after touchdown. |
| 28 Jul 1976 | Viking 1 Lander | Robotic arm collected its first soil samples for onboard analysis. |
| 7 Aug 1976 | Viking 2 Orbiter | Entered Mars orbit. |
| 3 Sep 1976 | Viking 2 Lander | Landed at Utopia Planitia, about 6,460 km from Viking 1. |
| 12 Sep 1976 | Viking 2 Lander | Began its soil-sampling sequence. |
| 16 Nov 1976 | Both missions | NASA announced that both had achieved their primary mission goals; extended operations continued. |
| May 1978 | Both missions | Extended mission phase ended; continuation operations followed. |
| Jul 1979 | Viking 1 Orbiter | Entered its later orbital survey phase (continued to July 1980). |
| 24–25 Jul 1978 | Viking 2 Orbiter | Orbiter operations ended following leak problems. NASA pages differ by one day on the recorded shutdown date; show this as a 24–25 July 1978 shutdown window or explain the source discrepancy. |
| 7 Aug 1980 | Viking 1 Orbiter | Shut down after exhausting attitude-control propellant, following approximately 1,489 orbits. |
| 11–12 Apr 1980 | Viking 2 Lander | Last data/communications reached Earth on 11 April in NASA's spacecraft and astrobiology summaries; the Viking 2 mission page lists 12 April as the end-of-mission date. Show the final data on 11 April and the recorded mission end on 12 April. |
| 11–13 Nov 1982 | Viking 1 Lander | A faulty command interrupted communications on 11 November; NASA's detailed spacecraft/astrobiology summaries place the communication/end-of-mission date on 13 November. Show the interruption and final end-of-mission as separate annotations rather than pretending the sources give a single identical date. |

### The shutdown story — separate endings

- **Viking 2 Orbiter:** It completed 706 orbits. NASA's Viking 2 page says operations ended on 24 July 1978 after leak problems; NASA's general spacecraft-and-science page records 25 July. It was the first Viking orbiter to fall silent.
- **Viking 1 Orbiter:** It continued much longer, completing roughly 1,489 orbits. It was shut down on 7 August 1980 after running out of attitude-control propellant.
- **Viking 2 Lander:** Its last data arrived on 11 April 1980; NASA's Viking 2 mission timeline lists 12 April as the end of the mission.
- **Viking 1 Lander:** It lasted longest. A faulty command interrupted communications on 11 November 1982. NASA's broader spacecraft/astrobiology pages identify 13 November 1982 as the end of communication/end of mission. No later attempts restored contact.

NASA's sources are not perfectly consistent about the exact calendar day for the final Viking 2 orbiter and lander events, and they distinguish the command interruption from the end of communications for Viking 1. Do not silently erase this difference. Use the ranges/annotations above in the timeline and include a small note: **“NASA mission summaries differ by one or two days depending on whether they record shutdown, last received data, or end of mission.”**

### Naming their resting places

NASA later gave the landers memorial station names:

- Viking 1 Lander: **Thomas Mutch Memorial Station**, named in honour of the Viking imaging-team leader.
- Viking 2 Lander: **Gerald Soffen Memorial Station**, named in honour of the Viking project scientist.

These names can appear as a quiet epilogue, not as a claim that the machines are active.

---

## 9. GOODBYE — the last signal and the legacy

### Facts the ending must preserve

- Both orbiters were shut down decades ago.
- Both landers stopped transmitting decades ago.
- The landers remain at their landing sites on Mars as inactive hardware. They are not currently operating or sending messages.
- The orbiters' exact present physical fate should not be invented. The experience only needs to say that their missions ended and their communications/operations stopped.
- Their work was not a failure. They completed their primary mission objectives and exceeded their planned operating lives.
- Their images and measurements remain on Earth and continue to be scientifically and historically valuable.

### Suggested emotional closing narration

> We crossed the distance between two worlds carrying questions from Earth. One of us watched from above; the other reached down and touched the soil. We photographed the plains, measured the thin air, listened for movement, and tested the dust for the chemistry of life.
>
> We did not return with proof that Mars was alive. But we returned with something humanity had never possessed before: a close, lasting record of another world.
>
> One by one, our messages became quiet. The orbiters completed their watch. The landers sent their final data and fell silent. No new signal comes from them now.
>
> Yet they have not been forgotten. Two landers remain where they completed their work — still on Mars, beneath the same sky they once measured. Their machines are asleep, but their discoveries are awake in every mission that followed.
>
> We were Viking 1 and Viking 2. We went to Mars to explore. We completed our journey. And our story continues.

### Final visual direction

- Return the viewer to Mars after the timeline has reached the final end-of-mission dates.
- Show the two landers at their correct, geographically separate landing regions; do not place them next to each other.
- Let the sky and surface become quiet. Remove active telemetry pulses and moving science indicators.
- Fade the orbiters' communication paths first, then the lander signal indicators. Do not make the machines explode, crash or vanish.
- Leave each lander still in the landscape. Show a small final label with the station name, landing place and final communication date convention.
- Fade to a final line: **“Their signals ended. Their contribution did not.”**
- Finish with an archival image, a NASA credit and the source links.

---

## 10. NASA visual references and 3D assets

Use these NASA-hosted materials as the reference set. For the 3D experience, prefer the official GLB lander model and build any missing orbiter geometry from NASA's labelled diagram and reference images. Confirm the image format and cross-origin behaviour before using a remote asset directly in the running application; downloading and serving local copies may be more reliable.

| Asset | URL | Intended use |
|---|---|---|
| **Official NASA Viking Lander 3D model (GLB)** | [Viking Lander.glb](https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/viking-lander/Viking%20Lander.glb) | Best starting point for the lander in Three.js. Load with `GLTFLoader`. NASA identifies the model page as Viking 1; the two Viking landers used the same basic design. |
| NASA 3D model page | [NASA — Viking Lander 3D Resource](https://science.nasa.gov/3d-resources/viking-lander/) | Source page for the GLB. Model source credited by NASA to NASA/Michael D. Carbajal. |
| NASA Viking Lander Model photograph | [PIA09703 — Viking Lander Model](https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia09/pia09703/PIA09703.jpg?fit=clip&h=826&w=1024) | Hardware/model visual reference for proportions and instrument placement. Credit: NASA/JPL-Caltech/University of Arizona. |
| Viking spacecraft artist concept | [Viking spacecraft with orbiter and aeroshell-encased lander](https://assets.science.nasa.gov/content/dam/science/psd/mars/resources/detail_files/7/7762_viking-spacecraft-full2.jpg/jcr%3Acontent/renditions/cq5dam.web.1280.1280.jpeg) | Shows how the orbiter and protected lander were arranged during cruise. |
| Viking orbiter labelled diagram | [NASA Viking Orbiter line drawing](https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/internal_resources/3513/Line_drawing_of_Viking_Orbiter-1.jpeg?fit=clip&h=653&w=1024) | Build accurate solar wings, antenna, propulsion and instrument placement. |
| Viking lander labelled diagram | [NASA Viking Lander line drawing](https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/internal_resources/3514/Viking_Lander_Line_Drawing-1.jpeg?fit=clip&h=778&w=1024) | Build and label cameras, sampler arm, RTGs, antennas, meteorology boom, seismometer and engines. |
| Viking landing sequence concept | [NASA archival landing sequence illustration](https://images-assets.nasa.gov/image/101-ksc-76pc-303/101-ksc-76pc-303~large.jpg?crop=faces%2Cfocalpoint&fit=clip&h=1920&w=1505) | Visual reference for the parachute and terminal-descent sequence. It is an illustration, not live mission footage. |
| Viking 1 spacecraft reference | [NASA Viking 1 spacecraft image](https://science.nasa.gov/wp-content/uploads/2024/03/261003main-02-viking1-full.jpg?w=1041) | Additional physical reference for the spacecraft configuration. |
| First Viking 1 surface image | [NASA Viking 1 first image — PIA00381](https://photojournal.jpl.nasa.gov/catalog/PIA00381) | Show the first surface image in the landing chapter. Use a web-friendly image download from the Photojournal page. |
| Viking 2 first surface image | [NASA Viking 2 first surface image — PIA00396](https://photojournal.jpl.nasa.gov/catalog/PIA00396) | Show that the second lander also returned its own first view of Mars. |
| NASA image and mission asset collection | [NASA — Viking Mission Resources](https://science.nasa.gov/mars/resources/viking-mission-resources/) | Additional spacecraft photos, models, launch preparations, landing illustration, orbiter and lander diagrams, and downloadable material. |
| 50-year anniversary story | [NASA — Viking: 50 Years on Mars](https://science.nasa.gov/mission/viking/viking-50-years-on-mars/) | Storytelling, first photo, legacy, landing-site map and historical video. |

### Model-loading guidance

- Load the lander GLB using the project's existing Three.js loader pattern (normally `GLTFLoader`).
- Verify scale, centre/origin, rotation and material appearance after loading. The model may need a neutral scale adjustment for the scene, but do not distort the proportions.
- Use one loaded model as a reusable asset for both Viking landers. Apply only subtle scene-specific dust/lighting differences; do not invent different lander designs.
- No official orbiter GLB is identified in the NASA 3D resource linked above. Build the orbiter using the NASA line drawing and full-spacecraft artist concept as references, or use an already available project asset that can be verified as the Viking orbiter.
- Use the labelled drawings for hotspot placement. Do not label a visually guessed component as a specific instrument unless the drawing or NASA text supports it.
- If remote NASA media cannot be loaded reliably in the browser, download it into the project's local public/assets directory and serve it locally. Keep attribution metadata with each local file.
- NASA media is generally available for public use subject to NASA media usage guidance and third-party credit restrictions. Retain the original NASA credit lines and verify usage terms for every asset before publishing.

---

## 11. Recommended Three.js chapter structure

Implement these as chapters/scenes inside the current app. The exact component names and state handling should follow the starter project.

| Chapter | Scene and camera idea | Main interaction / information |
|---|---|---|
| 00 — The Question | Dark space; Earth and Mars in the distance; slow approach to Mars. | Title, mission question, “Begin journey” action. |
| 01 — The Beginning | Cape Canaveral launch pad; Titan IIIE-Centaur and the Viking spacecraft. | Two launch dates, launch location, spacecraft assignment swap note. |
| 02 — The Journey | Earth-to-Mars travel; spacecraft pair moving through space. | Course correction markers and a time-compressed cruise timeline. |
| 03 — The Watchers | Viking orbiters arrive; camera circles Mars; landing areas highlighted. | Orbiter hotspots, map coverage, image count, landing-site selection. |
| 04 — The Descent | Separate the lander from the orbiter; animate aeroshell entry, parachute and terminal descent. | Step-by-step landing sequence with labels. Run Viking 1 first, then Viking 2. |
| 05 — First Footprints | Viking 1 at Chryse Planitia, then Viking 2 at Utopia Planitia. | First surface images, landing dates and site comparison. |
| 06 — The Laboratories | Close-up of each lander; extend sampler arm; reveal lab and weather instruments. | Interactive lander hotspots and three biology experiments. |
| 07 — What Mars Revealed | Transition between orbital global maps and lander-level soil/weather results. | 52,663 orbital images, 97% mapping, 4,500 surface images, science findings and life-search caution. |
| 08 — The Long Watch | Time moves forward; show both landers and orbiters continuing beyond the nominal 90-day plan. | Scrubbable timeline; separate machine status markers. |
| 09 — Silence | Show each orbiter and lander going silent on its own documented date. | Clear status changes and NASA date discrepancy notes. |
| 10 — The Legacy | Quiet Martian landscape; inactive landers remain at their sites; fade to NASA imagery and credits. | Final narration, memorial station names, source list and replay option. |

### Interaction requirements

- Chapter navigation: next / previous, chapter list or progress indicator.
- Timeline scrubbing: selecting a date updates the displayed mission event and machine status.
- Machine filter: “Viking 1,” “Viking 2,” and “Both.”
- Clickable model hotspots: show component name, purpose, and one-sentence explanation.
- Landing-site comparison: show Chryse Planitia and Utopia Planitia on a Mars globe or map.
- Information density: show a short sentence first; allow visitors to open a “Learn more” panel for the technical detail.
- Accessibility: keyboard operation, visible focus, readable contrast, reduced-motion mode, captions for all narration, and controls that do not rely only on colour.
- The scene must still tell the story if the user does not click every hotspot.

### Visual language

- Use a restrained 1970s NASA documentary / science-museum aesthetic.
- Space scenes: dark, low-noise star field; avoid overloading the screen with decorative effects.
- Mars scenes: muted rust/orange terrain, dusty atmosphere, realistic shadows and a restrained sky.
- Technical overlays: thin lines, small labels, instrument callouts, date stamps and archival-photo panels.
- Use the real spacecraft silhouette and its three-legged lander structure as the visual anchor.
- Avoid futuristic holograms, fantasy spacecraft details, exaggerated flames or a science-fiction version of Mars.
- The ending should become visually quieter than the beginning.

---

## 12. Fact-checking rules — do not get these wrong

1. **Four principal machines:** two orbiters and two landers. Each named Viking mission included both an orbiter and a lander.
2. **Different launch and landing dates:** Viking 1 launched 20 August 1975 and landed 20 July 1976. Viking 2 launched 9 September 1975 and landed 3 September 1976.
3. **Correct landing sites:** Viking 1 = Chryse Planitia; Viking 2 = Utopia Planitia.
4. **Orbiters did not land.** The landers separated and descended; orbiters remained in Mars orbit while working.
5. **Landers were stationary.** They were not rovers, had no wheels and did not drive around.
6. **Power distinction:** orbiters used solar panels; landers used two plutonium-238 RTGs each.
7. **The landers analysed soil on Mars.** They did not collect samples and return them to Earth.
8. **Life-search result:** unexpected chemistry, no definitive evidence of living microorganisms. Do not claim a confirmed life discovery or that the mission proved Mars has never had life.
9. **Viking 1 seismometer:** inoperable. Do not show a successful Viking 1 marsquake measurement.
10. **Shutdowns were separate:** Viking 2 Orbiter ended in July 1978; Viking 1 Orbiter in August 1980; Viking 2 Lander in April 1980; Viking 1 Lander in November 1982.
11. **Date nuance:** NASA sources differ slightly for the exact Viking 2 orbiter/lander shutdown day and distinguish Viking 1's command interruption from the final end-of-mission date. Preserve the notes in Section 8.
12. **Physical presence:** the landers remain as silent hardware at their landing sites. Do not depict them as active today or invent the present orbital status of the orbiters.
13. **Mission duration:** nominally about 90 days for the landers; both surface missions lasted much longer. Do not imply that the project was designed to operate for six years.
14. **First landing wording:** Viking 1 was the first fully successful U.S. Mars landing/long-lived U.S. surface operation; do not erase the earlier Soviet Mars 3 touchdown.
15. **Emotional language:** poetic personification is allowed in the final narration, but factual panels must remain factual.

---

## 13. Suggested on-screen microcopy

Use these as concise UI labels if useful. The development agent may refine wording without changing the meaning.

- **Start:** “Two explorers. Four machines. One question: could Mars support life?”
- **Orbiter:** “The watcher above. It mapped the planet and carried messages between Mars and Earth.”
- **Lander:** “The laboratory below. It photographed, sampled and measured the world beneath it.”
- **First landing:** “20 July 1976 — the first successful U.S. landing on Mars.”
- **Second landing:** “3 September 1976 — a second laboratory reaches another Martian landscape.”
- **Life experiments:** “Strange reactions. Important questions. No definitive evidence of life.”
- **Science legacy:** “More than 52,000 orbital images. About 97% of Mars mapped.”
- **Shutdown:** “The signal ended. The data remained.”
- **Goodbye:** “Their signals ended. Their contribution did not.”

---

## 14. Completion checklist for the development agent

- [ ] Existing starter project inspected; current architecture preserved.
- [ ] Story has a clear beginning, journey, surface work, timeline, shutdown and goodbye.
- [ ] Both Viking missions are represented, not only Viking 1.
- [ ] Each mission is shown as an orbiter + lander pair.
- [ ] Orbiter and lander roles are visually and factually distinct.
- [ ] NASA lander GLB is integrated or a clear fallback is provided.
- [ ] Orbiter geometry is based on NASA's technical reference.
- [ ] Descent, parachute and terminal landing sequence are represented accurately.
- [ ] Hotspots explain the major instruments and spacecraft systems.
- [ ] First images, soil sampling, biology tests and science results are included.
- [ ] The timeline distinguishes the four separate end-of-service events.
- [ ] NASA's one-day / end-of-mission date discrepancies are not hidden.
- [ ] The emotional ending is grounded in the real history.
- [ ] NASA image/model credits and source links are visible.
- [ ] Responsive design, loading states, reduced motion and keyboard controls are tested.
- [ ] No false statement that Viking discovered life, returned samples to Earth, or that the landers were mobile rovers.

---

## 15. Sources

### Primary pages supplied by the team

1. [NASA — Viking 1 Mission](https://science.nasa.gov/mission/viking-1/)
2. [NASA — Viking: 50 Years on Mars](https://science.nasa.gov/mission/viking/viking-50-years-on-mars/)

### Additional NASA sources used to complete and cross-check the story

3. [NASA — Viking 2 Mission](https://science.nasa.gov/mission/viking-2/)
4. [NASA — Viking Spacecraft and Science](https://science.nasa.gov/mission/viking/spacecraft-and-science/)
5. [NASA — Viking Project and Astrobiology](https://science.nasa.gov/astrobiology/missions/viking-project/)
6. [NASA — Viking Mission Resources and Spacecraft Images](https://science.nasa.gov/mars/resources/viking-mission-resources/)
7. [NASA — Viking Lander 3D Resource](https://science.nasa.gov/3d-resources/viking-lander/)
8. [NASA Photojournal — Viking Lander Model (PIA09703)](https://science.nasa.gov/photojournal/viking-lander-model/)
9. [NASA History — 45 Years Ago: Viking 1 and 2 off to Mars](https://www.nasa.gov/history/45-years-ago-viking-1-and-2-off-to-mars/)
10. [NASA Planetary Data System — Viking Labeled Release dataset](https://data.nasa.gov/dataset/vl1-vl2-mars-labeled-release-v1-0-46220)

**Research note:** The supplied Viking 1 and 50-years pages provide the main mission narrative. NASA's linked Viking 2, spacecraft/science, astrobiology and mission-resource pages were used to complete the paired mission story, component functions, shutdown details and NASA-hosted visual references. Where NASA pages differ by a day on shutdown/end-of-mission reporting, the difference is explicitly preserved in the timeline rather than hidden.
