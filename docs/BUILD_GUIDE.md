# ECHOES: Three.js Web App Build Guide

*Story, screen specifications and step-by-step development instructions for the NASA Space Apps 2026 challenge "Abandoned but not Forgotten". Written to be read by a human developer and by a VS Code AI agent.*

---

## 0. How to use this file with a VS Code AI agent

1. Create an empty folder and open it in VS Code.
2. Save this file as `docs/BUILD_GUIDE.md`.
3. Copy the block in **Section 15** into `AGENTS.md` (or `.github/copilot-instructions.md`, depending on your agent) so the rules persist across sessions.
4. Work **one step at a time** from Section 9. For each step, paste the step's *Agent prompt* into the agent, run the app, check the *Acceptance criteria*, then commit.
5. Never ask the agent to "build everything". Large one-shot requests produce broken, untestable code.
6. Build with **placeholder graphics first** (primitives, free textures). Swap in polished models at Step 14.

---

## 1. The story (as designed)

### Screen 1: Home

The user lands on a quiet, deserted place on Earth at night. The sky is full of stars with the occasional shooting star. The app name is shown at the top of the page. A rocket ship stands on the ground and a small child stands next to it. There is **one button only: Start**.

When the user presses **Start**, the child walks into the rocket ship. The door closes.

**Transition 1 (first-person take-off):** the view becomes first person from inside the rocket. The rocket shakes, lifts off, rises through the sky and out into space.

### Screen 2: Select your destination

A space scene with twinkling stars. Two large circles, one **Moon** and one **Mars**, each with its own surface graphics, both rotating continuously. In the middle between them the words **"Select your destination"** are displayed. The user chooses Moon or Mars.

**Transition 2 (first-person landing):** still in first person, the rocket flies toward the chosen world, descends and lands on it.

### Screen 3: Explorer selection (memorial and living museum)

The user sees **nine NASA explorers** standing on the surface of the world they chose. This screen is both:

- a **memorial** for explorers that have gone silent or been shut down, and
- a **living display** where explorers that are still active are shown in 3D, working in their environment.

When the cursor moves over an explorer, a **hologram panel** appears on the **right side** of the screen with the explorer's details and an **Explore** button. The panel includes:

- name and mission information,
- **time period** (start and end, or "active"),
- status (memorial or active),
- **route** shown on a small 3D Mars (or Moon) model,
- **filters** to filter the route (for example by mission phase or year range).

**Transition 3:** when the user presses **Explore**, the hologram pops out and **shoots directly toward the user's screen**. The screen goes **black**. The user moves to the next page.

### Screen 4: The explorer's story

This page tells the story of the explorer the user selected. **This part will be specified later.** For now, build an empty route and a placeholder page that receives the selected explorer (Section 13).

---

## 2. Screen specifications

### 2.1 Screen 1: Home

| Element | Specification |
|---|---|
| Title | App name **ECHOES** at the top center, HTML overlay, futuristic font |
| Subtitle (optional) | "Humanity explored. Humanity departed. History remained." |
| Background | Desert ground plane, dark horizon, gradient night sky, 3000+ stars with slow twinkle, a shooting star every 4 to 9 seconds at random |
| Rocket | Standing upright on the right of center, idle glow at the base |
| Child | Small figure to the left of the rocket, subtle idle animation (breathing or looking up) |
| Button | One button labeled **Start** below the scene, keyboard focusable |
| Audio | Silent until Start is pressed (browser autoplay rules). Optional sound toggle |
| Camera | Fixed, very slow drift (a few pixels of parallax following the mouse) |

**Start sequence (about 8 seconds total):**

1. Button fades out (0.3 s).
2. Child turns toward the rocket and walks to the door (3 s).
3. Child enters; door closes (1 s).
4. Transition 1 begins.

### 2.2 Transition 1: First-person take-off

| Time | Event |
|---|---|
| 0.0 to 1.0 s | Cut to cockpit view: dark interior, small window showing the desert and sky, dashboard lights, camera shake begins |
| 1.0 to 3.0 s | Countdown 3-2-1 text on the HUD, engine rumble builds, shake increases |
| 3.0 to 6.0 s | Lift-off: ground drops away, horizon curves, sky changes from dark blue to black, stars grow brighter |
| 6.0 to 7.5 s | Shake fades, silence, the view settles in space, fade to Screen 2 |

### 2.3 Screen 2: Destination

| Element | Specification |
|---|---|
| Background | Deep space, twinkling stars (different phase per star), optional faint nebula |
| Planets | Two spheres, left Moon, right Mars, each about 30% of screen width, with textures and a normal or bump map, rotating continuously |
| Text | "Select your destination" in the middle between the planets |
| Hover | Planet scales to 1.08, rim glow, label appears (Moon or Mars) |
| Click | Selects the destination and starts Transition 2 |
| Keyboard | Left and Right arrows switch focus, Enter selects |

### 2.4 Transition 2: First-person landing

| Time | Event |
|---|---|
| 0.0 to 1.0 s | Cockpit view again, the selected planet fills the window |
| 1.0 to 4.0 s | Approach: planet grows, surface detail appears, subtle shake |
| 4.0 to 6.0 s | Descent: retro-thruster glow, dust particles, camera lowers toward the ground |
| 6.0 to 7.0 s | Touchdown bump, dust cloud, fade into Screen 3 |

### 2.5 Screen 3: Explorer selection

| Element | Specification |
|---|---|
| World | Surface diorama (Moon grey or Mars orange terrain, horizon, sky color matched to the world) |
| Explorers | **9 slots** arranged in a gentle arc or grid, each a 3D model on a small plinth |
| Memorial explorers | Dimmed lighting, dust-covered material, no motion, a soft white "candle" light, a small plaque with name and years |
| Active explorers | Full lighting, animated (wheels turn, arm moves, helicopter blades spin), subtle moving shadow, a green status light |
| Hover | Outline glow, cursor changes, a thin beam connects to the hologram panel |
| Hologram panel | Right side, 28 to 32% of screen width, scanline and glow effect, appears with a scale and flicker animation |
| Panel contents | Name, status chip, years, one-sentence summary, mini globe with route, route filters, **Explore** button |
| Click or Enter | Same as pressing **Explore** |
| Mobile | Panel becomes a bottom sheet; tap an explorer to select, tap Explore to continue |

### 2.6 Transition 3: Hologram shoots into the screen

1. Panel stops following the hover (locks).
2. Panel scales from 1x to about 12x toward the camera with increasing blur and brightness (0.7 s).
3. Screen flashes white-blue for 80 ms, then fades to full black (0.4 s).
4. Hold black for 0.5 s while the story page loads in the background.
5. Navigate to Screen 4.

### 2.7 Screen 4 (placeholder)

Shows the selected explorer's name and a "Story coming soon" message. See Section 13.

---

## 3. The explorer roster (9 slots per destination)

> NASA has fewer than nine rovers in total, so each screen holds **nine explorer slots** that may include rovers, landers, a helicopter and other hardware. Label each item with its true type. Everything is data-driven so you can change the roster without touching code.

**Verify every date and status against NASA before shipping. Active or inactive status can change.**

### Mars (9 slots)

| # | Explorer | Type | Approx. period | Status (verify) |
|---|---|---|---|---|
| 1 | Sojourner | Rover | 1997 | Memorial |
| 2 | Spirit | Rover | 2004 to 2010 | Memorial |
| 3 | Opportunity | Rover | 2004 to 2018 | Memorial |
| 4 | Curiosity | Rover | 2012 to present | Active |
| 5 | Perseverance | Rover | 2021 to present | Active |
| 6 | Ingenuity | Helicopter | 2021 to 2024 | Memorial |
| 7 | Viking 1 | Lander | 1976 to 1982 | Memorial |
| 8 | Phoenix | Lander | 2008 | Memorial |
| 9 | InSight | Lander | 2018 to 2022 | Memorial |

### Moon (6 defined, 3 slots left for you to choose)

| # | Explorer | Type | Approx. period | Status (verify) |
|---|---|---|---|---|
| 1 | Lunar Roving Vehicle, Apollo 15 | Rover | 1971 | Memorial |
| 2 | Lunar Roving Vehicle, Apollo 16 | Rover | 1972 | Memorial |
| 3 | Lunar Roving Vehicle, Apollo 17 | Rover | 1972 | Memorial |
| 4 | Apollo 11 Lunar Module descent stage | Descent stage | 1969 | Memorial |
| 5 | Apollo lunar surface experiment package (ALSEP) | Instruments | 1969 to 1977 | Memorial |
| 6 | Apollo retroreflector array | Instrument | 1969 to present | Check with a NASA source |
| 7 to 9 | Your choice (for example Surveyor 3, other Apollo equipment) | Varies | Varies | Verify |

If you want the Moon screen to have only three explorers, set `slots` to 3 in the data file; the layout code must handle any count from 1 to 9.

---

## 4. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Build | Vite + React 18 + TypeScript | Fast, standard, agent-friendly |
| 3D | `three`, `@react-three/fiber`, `@react-three/drei` | Declarative three.js inside React |
| Post effects | `@react-three/postprocessing` | Bloom for stars, thrusters and hologram glow |
| State | `zustand` | One small global store for the journey |
| Animation | `gsap` | Timelines for cutscenes and camera moves |
| Audio | `howler` | Cross-browser sound |
| Routing | `react-router-dom` | URL for the story page (`/story/:id`) |
| Styling | CSS modules or Tailwind | Hologram and HUD overlays |
| Dev tools | `leva`, `r3f-perf` | Tune values live and watch performance |
| Tests | `vitest`, `@testing-library/react`, `playwright` | Unit, component, end-to-end |
| Lint | `eslint`, `prettier` | Keep agent output consistent |

### Install

```bash
npm create vite@latest echoes -- --template react-ts
cd echoes
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing \
  zustand gsap howler react-router-dom
npm install -D @types/three @types/howler leva r3f-perf vitest \
  @testing-library/react @testing-library/jest-dom jsdom playwright eslint prettier
npm run dev
```

Requirements: Node 20 or newer, a browser with WebGL2.

---

## 5. Architecture

### 5.1 Key decision: one persistent canvas

Use **one `<Canvas>` for the whole app** and swap scenes by state. Do not create a new canvas per page. This is what makes the continuous first-person transitions possible (the rocket never "loads a new page" while flying).

```text
+---------------------------- <App> ----------------------------+
|  <Canvas> (always mounted)                                     |
|    <Stars/> <ShootingStars/> <Bloom/> <CameraRig/>             |
|    {phase === HOME}          -> <HomeScene/>                   |
|    {phase === TAKEOFF}       -> <CockpitScene mode="takeoff"/> |
|    {phase === DESTINATION}   -> <DestinationScene/>            |
|    {phase === LANDING}       -> <CockpitScene mode="landing"/> |
|    {phase === EXPLORERS}     -> <ExplorersScene/>              |
|                                                                |
|  <HTML overlays> Title, Start button, HUD, Hologram panel,     |
|                  Blackout, Skip, Sound toggle, Captions        |
|                                                                |
|  <Router> /story/:id -> <StoryPage/> (outside the canvas)      |
+----------------------------------------------------------------+
```

### 5.2 The journey state machine

```text
HOME --start--> HOME_WALK --done--> TAKEOFF --done--> DESTINATION
DESTINATION --select(moon|mars)--> LANDING --done--> EXPLORERS
EXPLORERS --hover(id)--> (panel shows)   EXPLORERS --explore(id)--> HOLOGRAM_LAUNCH
HOLOGRAM_LAUNCH --done--> BLACKOUT --done--> STORY (/story/:id)
```

Only the store may change `phase`. Components call actions; they never set the phase directly.

### 5.3 Folder structure

```text
src/
  main.tsx
  App.tsx                    Canvas + overlays + router
  store/journey.ts           phase, destination, selectedExplorer, soundOn, reducedMotion
  data/
    explorers.mars.json      9 explorers
    explorers.moon.json
    routes/*.json            route polylines per explorer
    schema.ts                zod schemas
  scenes/
    HomeScene.tsx
    CockpitScene.tsx
    DestinationScene.tsx
    ExplorersScene.tsx
  components/
    Stars.tsx                twinkling star field (shader)
    ShootingStars.tsx
    Rocket.tsx
    Child.tsx
    Planet.tsx               textured rotating sphere
    ExplorerModel.tsx        loads a model, memorial or active mode
    Plinth.tsx
    CameraRig.tsx            cutscene camera and shake
    DustParticles.tsx
  ui/
    Title.tsx  StartButton.tsx  Hud.tsx  Blackout.tsx
    HologramPanel.tsx  RouteGlobe.tsx  RouteFilters.tsx
    SoundToggle.tsx  SkipButton.tsx
  pages/StoryPage.tsx        placeholder for Screen 4
  lib/geo.ts                 latLonToVector3
  lib/motion.ts              prefers-reduced-motion helper
public/
  models/*.glb  textures/*.webp  audio/*.mp3
docs/BUILD_GUIDE.md
```

---

## 6. Data model

### 6.1 Explorer record

```json
{
  "id": "opportunity",
  "name": "Opportunity",
  "type": "rover",
  "destination": "mars",
  "slot": 3,
  "status": "memorial",
  "years": { "start": 2004, "end": 2018 },
  "summary": "One sentence, written for ages 10 to 16.",
  "model": "/models/opportunity.glb",
  "modelFallback": "rover-primitive",
  "routeFile": "/data/routes/opportunity.json",
  "sources": [{ "label": "NASA Mars Exploration", "url": "https://science.nasa.gov/mars/" }]
}
```

`status` is `"memorial"` or `"active"`. Additional states you may add later: `"unknown"`.

### 6.2 Route record (used by the mini globe and filters)

```json
{
  "explorerId": "opportunity",
  "segments": [
    {
      "phase": "Landing site to Endurance",
      "years": [2004, 2005],
      "points": [[-5.53, -1.95], [-5.52, -1.96]]
    }
  ],
  "note": "Placeholder coordinates. Replace with NASA traverse data."
}
```

`points` are `[longitude, latitude]` in degrees. **Do not invent route coordinates.** Use NASA or USGS traverse maps and cite them; until then keep short placeholder routes clearly labelled as placeholders.

### 6.3 Journey store (TypeScript)

```ts
// store/journey.ts
import { create } from 'zustand'

export type Phase =
  | 'HOME' | 'HOME_WALK' | 'TAKEOFF' | 'DESTINATION' | 'LANDING'
  | 'EXPLORERS' | 'HOLOGRAM_LAUNCH' | 'BLACKOUT' | 'STORY'
export type Destination = 'moon' | 'mars'

type Journey = {
  phase: Phase
  destination: Destination | null
  hoveredId: string | null
  selectedId: string | null
  soundOn: boolean
  reducedMotion: boolean
  start: () => void
  finish: (from: Phase) => void
  choose: (d: Destination) => void
  hover: (id: string | null) => void
  explore: (id: string) => void
  toggleSound: () => void
}

const next: Partial<Record<Phase, Phase>> = {
  HOME_WALK: 'TAKEOFF', TAKEOFF: 'DESTINATION', LANDING: 'EXPLORERS',
  HOLOGRAM_LAUNCH: 'BLACKOUT', BLACKOUT: 'STORY',
}

export const useJourney = create<Journey>((set, get) => ({
  phase: 'HOME', destination: null, hoveredId: null, selectedId: null,
  soundOn: false,
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  start: () => get().phase === 'HOME' && set({ phase: 'HOME_WALK' }),
  finish: (from) => get().phase === from && next[from] && set({ phase: next[from]! }),
  choose: (d) => get().phase === 'DESTINATION' && set({ destination: d, phase: 'LANDING' }),
  hover: (id) => get().phase === 'EXPLORERS' && set({ hoveredId: id }),
  explore: (id) => get().phase === 'EXPLORERS' && set({ selectedId: id, phase: 'HOLOGRAM_LAUNCH' }),
  toggleSound: () => set({ soundOn: !get().soundOn }),
}))
```

Guards (`get().phase === ...`) prevent double clicks from skipping a cutscene.

---

## 7. Visual design

| Element | Value |
|---|---|
| Space black | `#05070D` |
| Lunar silver | `#C9CED6` |
| Mars orange | `#E2663A` |
| Hologram cyan | `#4FD8FF` (panel border, scanlines, glow) |
| Memorial light | warm white `#FFF3D6` (candle glow) |
| Active status light | green `#5BE38A` |
| Headings font | Orbitron or Space Grotesk (headings only) |
| Body font | Inter, at least 16 px |

Post-processing: **Bloom** with a high luminance threshold so only stars, thrusters, candles and the hologram glow. Keep vignette subtle.

Rule: **never rely on color alone.** Memorial vs active is also shown by a text chip ("Memorial" or "Active") and an icon.

---

## 8. Key code skeletons

Give these to the agent as starting points; it should adapt them, not copy blindly.

### 8.1 App with one persistent canvas

```tsx
// App.tsx
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Routes, Route } from 'react-router-dom'
import { useJourney } from './store/journey'

export default function App() {
  const phase = useJourney((s) => s.phase)
  return (
    <Routes>
      <Route path="/story/:id" element={<StoryPage />} />
      <Route path="*" element={
        <>
          <Canvas dpr={[1, 1.5]} camera={{ fov: 50, position: [0, 1.6, 8] }}>
            <color attach="background" args={['#05070D']} />
            <Stars /><ShootingStars /><CameraRig />
            {(phase === 'HOME' || phase === 'HOME_WALK') && <HomeScene />}
            {(phase === 'TAKEOFF' || phase === 'LANDING') && <CockpitScene mode={phase === 'TAKEOFF' ? 'takeoff' : 'landing'} />}
            {phase === 'DESTINATION' && <DestinationScene />}
            {(phase === 'EXPLORERS' || phase === 'HOLOGRAM_LAUNCH') && <ExplorersScene />}
            <EffectComposer><Bloom intensity={0.8} luminanceThreshold={0.85} mipmapBlur /></EffectComposer>
          </Canvas>
          <Overlays />   {/* title, start button, hud, hologram, blackout, sound, skip */}
        </>
      } />
    </Routes>
  )
}
```

### 8.2 Twinkling stars (shader points)

```tsx
// components/Stars.tsx
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vert = /* glsl */`
  attribute float aSize; attribute float aPhase;
  uniform float uTime; varying float vTw;
  void main() {
    vTw = 0.6 + 0.4 * sin(uTime * 1.5 + aPhase * 6.2831);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * vTw * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`
const frag = /* glsl */`
  varying float vTw;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vTw;
    gl_FragColor = vec4(vec3(0.85, 0.9, 1.0), a);
  }`

export function Stars({ count = 3000, radius = 120 }) {
  const mat = useRef<THREE.ShaderMaterial>(null!)
  const { positions, sizes, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const phases = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(radius)
      positions.set([v.x, v.y, v.z], i * 3)
      sizes[i] = 0.5 + Math.random() * 1.8
      phases[i] = Math.random()
    }
    return { positions, sizes, phases }
  }, [count, radius])
  useFrame((_, dt) => { mat.current.uniforms.uTime.value += dt })
  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
      </bufferGeometry>
      <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag}
        uniforms={{ uTime: { value: 0 } }} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}
```

### 8.3 Shooting stars

Spawn logic (the agent writes the mesh): keep a pool of 3 streaks. Every `rand(4, 9)` seconds, pick a free streak, set a random start point in the upper sky, a direction down and across, speed about 60 units per second, life about 0.8 s. Draw each streak as a thin stretched plane with an additive gradient (bright head, transparent tail) and fade opacity over its life. Skip spawning when `reducedMotion` is true.

### 8.4 Cutscene camera with GSAP

```tsx
// components/CameraRig.tsx
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useJourney } from '../store/journey'

export function CameraRig() {
  const { camera } = useThree()
  const shake = useRef(0)                       // 0..1, animated by GSAP
  const phase = useJourney((s) => s.phase)
  const finish = useJourney((s) => s.finish)
  const reduced = useJourney((s) => s.reducedMotion)

  useEffect(() => {
    if (phase !== 'TAKEOFF') return
    const tl = gsap.timeline({ onComplete: () => finish('TAKEOFF') })
    const d = reduced ? 0.01 : 1
    tl.set(camera.position, { x: 0, y: 1.2, z: 0.2 })
      .to(shake, { current: 0.3, duration: 2 * d })
      .to(shake, { current: 1, duration: 1 * d })
      .to(camera.position, { y: 400, duration: 3 * d, ease: 'power2.in' }, '<')
      .to(shake, { current: 0, duration: 1.5 * d })
    return () => { tl.kill() }
  }, [phase])

  useFrame((s) => {
    if (shake.current > 0) {
      const t = s.clock.elapsedTime
      camera.position.x += Math.sin(t * 60) * 0.01 * shake.current
      camera.position.y += Math.cos(t * 55) * 0.01 * shake.current
    }
  })
  return null
}
```

Treat the sequence above as a pattern. Landing is the same idea in reverse (planet scale grows, camera descends, dust appears, touchdown bump).

### 8.5 Lat/long to 3D point (for the route globe)

```ts
// lib/geo.ts
import * as THREE from 'three'
export function latLonToVector3(latDeg: number, lonDeg: number, r = 1) {
  const lat = THREE.MathUtils.degToRad(latDeg)
  const lon = THREE.MathUtils.degToRad(lonDeg)
  return new THREE.Vector3(
    r * Math.cos(lat) * Math.cos(lon),
    r * Math.sin(lat),
    -r * Math.cos(lat) * Math.sin(lon),
  )
}
```

Write a unit test: `latLonToVector3(0, 0)` is `(1, 0, 0)`, `latLonToVector3(90, 0)` is `(0, 1, 0)`. Texture orientation may need a rotation offset; verify visually against a known landmark.

### 8.6 Hologram panel and launch

```tsx
// ui/HologramPanel.tsx  (outline)
// - fixed right, width 30vw, full height minus margins
// - reads hoveredId from store, finds explorer in data
// - contains: name, status chip, years, summary, <RouteGlobe/>, <RouteFilters/>, Explore button
// - appears with CSS animation: scaleY from 0.02 to 1 with a flicker (keyframes), scanlines overlay
```

```css
.holo {
  border: 1px solid #4FD8FF;
  background: linear-gradient(180deg, rgba(79,216,255,.12), rgba(79,216,255,.04));
  box-shadow: 0 0 24px rgba(79,216,255,.35), inset 0 0 24px rgba(79,216,255,.12);
  backdrop-filter: blur(6px);
  background-image: repeating-linear-gradient(0deg, rgba(255,255,255,.04) 0 1px, transparent 1px 3px);
}
@keyframes holoIn { 0%{transform:scaleY(.02);opacity:0} 40%{opacity:.8} 55%{opacity:.4} 100%{transform:scaleY(1);opacity:1} }
```

Launch (on **Explore**):

```ts
function launch(el: HTMLElement, id: string) {
  const { explore, finish, reducedMotion } = useJourney.getState()
  explore(id)                                          // phase -> HOLOGRAM_LAUNCH
  const tl = gsap.timeline({ onComplete: () => finish('BLACKOUT') })   // see note below
  if (!reducedMotion) {
    tl.to(el, { scale: 12, z: 600, opacity: 0.9, filter: 'blur(6px) brightness(2)', duration: 0.7, ease: 'power3.in' })
  }
  tl.to('#blackout', { opacity: 1, duration: 0.4 })
    .to({}, { duration: 0.5 })                         // hold black
    .add(() => { finish('HOLOGRAM_LAUNCH') })          // -> BLACKOUT, then STORY (navigate)
}
```

Agent note: make the final step call `navigate('/story/' + id)`. Keep the phase transitions consistent with Section 5.2 (the agent should simplify this snippet so each `finish` is called exactly once).

### 8.7 Memorial vs active explorer

```tsx
// components/ExplorerModel.tsx (outline)
// props: explorer, hovered
// memorial: material.color multiplied by 0.4, add a dust texture overlay, no useFrame animation,
//           <pointLight color="#FFF3D6" intensity={hovered ? 2.0 : 0.8} distance={4} /> placed above the model
// active:   play the GLB animation clip or a procedural motion (wheels rotate, arm swings, blades spin),
//           a small green emissive status light, a gentle patrol path inside the plinth area
// both:     on pointer over -> hover(explorer.id); on pointer out -> hover(null); on click -> hover + show panel
```

---

## 9. Step-by-step build plan (with agent prompts)

Commit after every step. If a step fails its acceptance criteria, fix it before moving on.

### Step 1: Scaffold and tooling

**Agent prompt:**
> Create a Vite React TypeScript project named `echoes`. Install three, @react-three/fiber, @react-three/drei, @react-three/postprocessing, zustand, gsap, howler, react-router-dom, and dev tools (vitest, eslint, prettier, leva, r3f-perf). Create the folder structure in `docs/BUILD_GUIDE.md` Section 5.3 with empty placeholder files. Configure ESLint and Prettier. Do not write feature code yet.

**Acceptance:** `npm run dev` shows a blank page, `npm run build` succeeds, folders exist.

### Step 2: Data, schemas and store

**Agent prompt:**
> Implement `store/journey.ts` exactly as the state machine in Section 5.2 and 6.3. Create `data/schema.ts` with zod schemas for Explorer and Route, create `data/explorers.mars.json` with the 9 Mars records from Section 3 (summaries can be placeholders), and `explorers.moon.json` with the 6 Moon records. Validate both files at startup. Write vitest tests for the store: invalid transitions are ignored, `choose` only works in DESTINATION.

**Acceptance:** tests pass; loading invalid data throws a readable error.

### Step 3: Persistent canvas, twinkling stars, title

**Agent prompt:**
> In `App.tsx` create one persistent `<Canvas>` with a night-sky background. Implement `Stars.tsx` with the shader from Section 8.2 (3000 stars, twinkle). Add the HTML overlay `Title` showing "ECHOES" at the top center. Add a very subtle camera parallax following the mouse (disabled if reduced motion).

**Acceptance:** 60 FPS on a laptop, stars visibly twinkle, title is readable.

### Step 4: Shooting stars

**Agent prompt:**
> Implement `ShootingStars.tsx` per Section 8.3: a pool of 3 streaks spawning every 4 to 9 seconds with random positions and directions, additive fade. Disable when `reducedMotion` is true.

**Acceptance:** a streak appears every few seconds, never more than 3 at once, no memory growth after 5 minutes.

### Step 5: Home scene (desert, rocket, child)

**Agent prompt:**
> Build `HomeScene.tsx`: a large dark desert ground plane with gentle dune displacement, a low horizon glow, and a sky gradient. Create `Rocket.tsx` from primitives (LatheGeometry body, cone nose, 3 fins, emissive window, base glow) standing on the right. Create `Child.tsx` from primitives (capsule body, sphere head, two limb groups) standing on the left with a subtle idle motion. Add the one **Start** button (HTML, below the scene, keyboard focusable). Use placeholder materials only.

**Acceptance:** the screen matches Section 2.1; Start is the only interactive control.

### Step 6: Start sequence (child walks into the rocket)

**Agent prompt:**
> On Start, call `start()`. In `HOME_WALK`, run a GSAP timeline: fade out the button, rotate the child toward the rocket, walk the child to the door with a leg swing animation, scale the child down slightly as it enters, close a door mesh, then call `finish('HOME_WALK')`. Provide a Skip button visible from the moment Start is pressed.

**Acceptance:** about 5 to 8 seconds, ends in TAKEOFF, Skip jumps straight to TAKEOFF, double-clicking Start does nothing extra.

### Step 7: Take-off transition (first person)

**Agent prompt:**
> Implement `CockpitScene.tsx` with `mode="takeoff"`: a dark cockpit interior (box frame, dashboard with emissive lights, one window showing the world), HUD countdown 3-2-1 in HTML, camera shake and the timeline in Section 2.2 using `CameraRig`. Raise the camera, change the sky from deep blue to black and make stars brighter as altitude increases. End by calling `finish('TAKEOFF')`.

**Acceptance:** the timeline matches Section 2.2; Skip works; with reduced motion the sequence shortens to under 1 second.

### Step 8: Destination screen

**Agent prompt:**
> Build `DestinationScene.tsx`: two `Planet` spheres (Moon left, Mars right) with textures, bump maps and continuous rotation, hover scale to 1.08 with rim glow, and the text "Select your destination" centered between them. Clicking or pressing Enter on a focused planet calls `choose('moon' | 'mars')`. Support Left and Right arrow keys. Use free NASA-derived textures or solid-color placeholders if textures are not yet available.

**Acceptance:** planets rotate continuously, hover and keyboard both work, click starts LANDING.

### Step 9: Landing transition

**Agent prompt:**
> Extend `CockpitScene.tsx` with `mode="landing"`. Read `destination` from the store. Follow the timeline in Section 2.4: the chosen planet grows, camera descends, `DustParticles` appear near the end, a touchdown bump shakes the camera, then call `finish('LANDING')`. The destination decides surface color and sky.

**Acceptance:** Moon landing shows a black sky and grey dust; Mars shows a butterscotch sky and orange dust.

### Step 10: Explorers scene

**Agent prompt:**
> Build `ExplorersScene.tsx`: a surface diorama for the chosen destination, and place the explorers from the matching JSON file on plinths in a gentle arc (support 1 to 9 explorers). Implement `ExplorerModel.tsx` per Section 8.7: memorial explorers are dimmed, still, with a warm candle light and a small plaque with name and years; active explorers are lit and animated with a green status light. Use primitive placeholder models (box and cylinder rovers) until real models arrive. On pointer over call `hover(id)`.

**Acceptance:** memorial and active are instantly distinguishable (light, motion, chip, icon), hover outlines the explorer.

### Step 11: Hologram panel

**Agent prompt:**
> Build `HologramPanel.tsx` on the right side (Section 2.5): holographic style with the CSS in Section 8.6, appears with the `holoIn` animation when `hoveredId` is set, shows name, status chip, years, summary, and an **Explore** button. Keep the panel visible while the pointer is over it (do not flicker when moving from the explorer to the panel). On mobile show it as a bottom sheet.

**Acceptance:** panel updates when the hovered explorer changes; Explore is keyboard reachable; no flicker.

### Step 12: Route globe and filters

**Agent prompt:**
> Build `RouteGlobe.tsx`: a small `<Canvas>` (or drei `View`) inside the panel showing a rotating mini Mars or Moon with the explorer's route drawn as a glowing line using `latLonToVector3` from Section 8.5. Add `RouteFilters.tsx`: chips to filter segments by mission phase and a year range slider. Filtering updates the drawn segments and animates the line. Load route data from `data/routes/*.json`. Use short placeholder routes clearly marked as placeholders; do not invent real coordinates.

**Acceptance:** toggling a filter changes the route instantly; the globe does not drop the main scene below 50 FPS; empty route shows "Route data coming soon".

### Step 13: Hologram launch, blackout and story route

**Agent prompt:**
> Implement Transition 3 per Section 2.6 using the pattern in Section 8.6. On **Explore**, lock the panel, scale it toward the camera, flash, fade to black via a full-screen `#blackout` element, then navigate to `/story/:id`. Create `StoryPage.tsx` as in Section 13 and make sure browser Back returns to the Explorers screen without replaying cutscenes.

**Acceptance:** about 2 seconds total, ends on `/story/<id>`, the id matches the explorer, no double navigation.

### Step 14: Audio

**Agent prompt:**
> Add Howler audio, started only after the Start click: ambient space loop, rocket rumble (take-off and landing), UI click, hologram hum, a soft "whoosh" for Transition 3. Provide a visible sound toggle (default on after Start, easily muted). Respect the toggle everywhere. Use royalty-free or original sounds and list credits in `docs/CREDITS.md`.

**Acceptance:** no sound before Start; mute works instantly; no audio errors in the console.

### Step 15: Replace placeholders with real assets

**Agent prompt:**
> Replace placeholder models and textures using the list in Section 11. Compress GLB files with gltf-transform (Draco and meshopt), convert textures to WebP at 2K maximum. Keep primitive fallbacks if a model fails to load (use `Suspense` and an error boundary). Update `CREDITS.md` with the source and license of every asset.

**Acceptance:** each explorer loads under 2 MB; the page works if one model fails.

### Step 16: Accessibility and reduced motion

**Agent prompt:**
> Implement: Skip buttons for each cutscene; `prefers-reduced-motion` shortens or replaces every camera move and disables shooting stars and shake; full keyboard control (Tab to Start, arrows plus Enter on the destination screen, Tab through explorers, Enter to Explore); visible focus styles; `aria-live` captions for key moments ("Lift-off", "Landing on Mars"); a readable list view of explorers that appears if WebGL is unavailable. Check contrast 4.5:1 on all text.

**Acceptance:** the whole journey is completable with keyboard only; Lighthouse accessibility score 90 or higher.

### Step 17: Performance pass

**Agent prompt:**
> Profile with r3f-perf. Cap `dpr` at 1.5, dispose geometries and textures when leaving scenes, lazy-load models per scene, reduce star count automatically if FPS drops below 30 for 3 seconds, and set `frameloop="demand"` only on static screens where no animation runs. Report before and after FPS numbers.

**Acceptance:** 60 FPS on a mid-range laptop, 30 FPS or better on a recent phone, initial JS under about 1.5 MB gzip.

### Step 18: Tests and deploy

**Agent prompt:**
> Add Playwright tests for the complete journey (Start, skip cutscenes, choose Mars, hover an explorer, open the panel, Explore, land on `/story/:id`). Add unit tests for the store and `latLonToVector3`. Configure deployment to Vercel or Netlify with a production build and verify the live URL on desktop and phone.

**Acceptance:** `npm test` and `npm run build` pass; the live link works.

---

## 10. Performance and quality targets

| Area | Target |
|---|---|
| Frame rate | 60 FPS desktop, 30+ FPS phone |
| Initial load | Home scene interactive in under 3 s on broadband |
| Models | Each under 2 MB, Draco compressed |
| Textures | WebP, 2K max, lazy-loaded per scene |
| Draw calls | Under about 150 per frame |
| Memory | No growth after repeating the whole journey 5 times |

Common pitfalls the agent must avoid: creating a new `THREE.Vector3` inside `useFrame` every frame, re-creating geometries on re-render (use `useMemo`), forgetting to dispose, putting text inside WebGL (use HTML overlays), and using `setState` every frame.

---

## 11. Asset list

| Asset | Source options | Note |
|---|---|---|
| Rocket | Build from primitives, or a CC0 model (Sketchfab, Kenney, Quaternius) | Check license, credit if needed |
| Child | Primitive figure, or a CC0 character with a walk clip (Mixamo, Quaternius) | Keep the style simple and friendly |
| Moon and Mars textures | NASA and USGS imagery, NASA Visible Earth, Solar System Scope textures | Check each license; credit NASA/USGS |
| Rovers and landers | NASA 3D Resources models | Check license and file size; use primitives as fallback |
| Desert ground | Procedural noise terrain, or a CC0 sand texture | Keep tiny |
| Sounds | Original, or royalty-free with license noted | Label dramatized sound |
| Route data | NASA and USGS traverse maps | Cite every source |

---

## 12. Testing checklist

- [ ] Start works once; double click does nothing
- [ ] Every cutscene can be skipped
- [ ] Reduced motion shortens or removes camera moves
- [ ] Moon and Mars both reach Screen 3 with the correct surface
- [ ] Memorial and active explorers look and behave differently
- [ ] Hover panel never flickers and stays on screen
- [ ] Route filters change the route
- [ ] Explore always lands on `/story/<correct id>`
- [ ] Browser Back from the story returns without replaying cutscenes
- [ ] Works on Chrome, Firefox, Safari and a phone
- [ ] No console errors, no memory growth after repeated runs

---

## 13. Screen 4 placeholder and extension contract

For now `StoryPage.tsx` shows the explorer name, years, status and a message "Story coming soon", plus a **Back to explorers** button. Design it so the later story can plug in without changing earlier screens:

```ts
// pages/StoryPage.tsx contract
type StoryProps = { explorerId: string }       // from the URL /story/:id
// Loads: data/stories/<id>.json  (scenes, narration, sources)
// Reads: the explorer record from the same JSON used on Screen 3
```

Keep a clean `data/stories/` folder ready. The story flow for Opportunity in the project documentation can become the first story file.

---

## 14. Accuracy and content rules

1. Every date, status and number has a source stored in the data.
2. Active or memorial status must be checked against NASA before release; do not assume it.
3. Do not invent final transmissions or quotes from spacecraft. Imagined first-person narration is labelled on screen as creative interpretation based on NASA records.
4. Do not invent route coordinates; use traverse data or mark placeholders as placeholders.
5. Use NASA images with credit lines; do not imply NASA endorsement of the project.
6. Write summaries for ages 10 to 16: short sentences, explain new words once.

---

## 15. Rules to paste into `AGENTS.md` (or `.github/copilot-instructions.md`)

```markdown
# Project rules for the AI agent

- Project: ECHOES, a three.js memorial web app about NASA explorers on the Moon and Mars.
- Source of truth: docs/BUILD_GUIDE.md. Follow its story, screens, state machine and steps.
- Stack: Vite, React 18, TypeScript, three, @react-three/fiber, @react-three/drei,
  @react-three/postprocessing, zustand, gsap, howler, react-router-dom.
- One persistent <Canvas>. Scenes switch by `phase` in the zustand store. Only the store changes `phase`.
- Do one build step at a time. Do not implement later steps unless asked.
- Use placeholder primitives until real assets are requested. Always provide a fallback if a model fails to load.
- Never allocate objects inside useFrame; use refs and useMemo. Dispose geometries/textures on unmount.
- UI text lives in HTML overlays, never inside WebGL.
- Every cutscene must be skippable and must respect prefers-reduced-motion.
- Keyboard accessibility is required for every interactive element.
- Never invent NASA facts, dates, quotes or coordinates. Put sources in the data files. Mark placeholders clearly.
- After each step: run lint, tests and build, then summarize what changed and how to verify it.
```

---

## 16. Definition of done

- The full journey works: Home, take-off, destination, landing, explorers, hologram, black, story page.
- Memorial and active explorers are clearly different, and all nine slots load.
- Hover panel shows time period, status, route on a mini globe and working route filters, with an **Explore** button.
- Cutscenes are skippable, reduced motion is respected, keyboard-only works.
- All facts are sourced, dramatized elements are labelled, credits are complete.
- Build passes, tests pass, live link verified on desktop and phone.

---

## 17. Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| Black canvas | Camera inside an object, or missing lights | Check camera position, add `ambientLight` |
| Stars invisible | Shader points clipped or alpha zero | Set `frustumCulled={false}`, check blending |
| Low FPS | High `dpr`, large textures, many lights | Cap `dpr`, compress textures, bake lights |
| Hover flickers | Pointer leaves model to panel | Keep hover while over the panel; add a short hide delay |
| Route line floats off the globe | Radius mismatch | Draw the line at `radius * 1.01` |
| Route looks rotated | Texture longitude offset | Add a rotation offset on the globe mesh |
| Cutscene runs twice | Effect re-runs on re-render | Guard with phase checks and `tl.kill()` in cleanup |
| Audio does not play | Autoplay policy | Start audio only after the Start click |
