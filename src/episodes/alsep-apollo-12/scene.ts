/**
 * Apollo 12 ALSEP scene.
 *
 * The narrator IS the ALSEP Central Station; the camera lives near its antenna mast.
 * Everything is procedural geometry.
 *
 * Layout (1 unit ≈ 1 m, north = -Z, east = +X, up = +Y):
 *   ALSEP origin         ( 0,  0,  0)   ← narrator / camera anchor
 *   SNAP-27 RTG          ( 2,  0,  1)
 *   Intrepid descent     (12,  0, -8)   ~14 m away (ENE) – scaled for visibility
 *   Surveyor 3 crater    (20, -1, 14)   ~25 m SE – scaled for visibility
 *
 * All geometry enlarged 3–4× vs. real dimensions so models are clearly visible
 * at the engine's 38° FOV from a few metres away.
 *
 * Calls available via { call: 'name' } in episode.ts:
 *   boot             – reset state at the start of every page
 *   liftoff          – animates ascent stage rising (silent – no air)
 *   moonquakeShake   – camera micro-shake + seismograph spike
 *   dayCycle         – begin the accelerated day/night loop
 *   finalShutdown    – power down glow and shutdown sequence
 */
import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector3,
  QuadraticBezierCurve3,
  PointLight,
} from 'three';
import type { Object3D } from 'three';
import gsap from 'gsap';
import { part, tube, type MachineMaterials, type MachineParts } from '../../engine/models';
import { hash } from '../../engine/noise';
import type { EpisodeContext, SceneBuild, SceneHandles } from '../../engine/types';

// ─── scene layout constants ───────────────────────────────────────────────────
/** Intrepid is parked about 14 m ENE – close enough to see clearly. */
export const INTREPID_X = 12;
export const INTREPID_Z = -8;
/** Surveyor 3 sits another ~12 m SE of Intrepid. */
export const SURVEYOR_X = 20;
export const SURVEYOR_Z = 14;
export const SURVEYOR_Y = -1;

// ─── RTG generator ───────────────────────────────────────────────────────────
function buildRTG(mats: MachineMaterials): Group {
  const rtg = new Group();
  // 46 cm cylinder body — scaled up 2.5× for visibility
  part(rtg, new CylinderGeometry(0.25, 0.25, 1.1, 16), mats.dark, 0, 0.55, 0);
  // 8 radiating fins
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const fin = part(rtg, new BoxGeometry(0.55, 1.1, 0.03), mats.alu,
      Math.cos(angle) * 0.35, 0.55, Math.sin(angle) * 0.35);
    fin.rotation.y = angle;
  }
  // cable to central station
  const curve = new QuadraticBezierCurve3(
    new Vector3(0, 0.15, 0),
    new Vector3(-1.0, 0.1, -0.5),
    new Vector3(-2.0, 0.08, -1.0),
  );
  const cableGeo = new TubeGeometry(curve, 20, 0.025, 6, false);
  const cable = new Mesh(cableGeo, mats.dark);
  rtg.add(cable);
  rtg.position.set(2, 0, 1);
  return rtg;
}

// ─── ALSEP Central Station ────────────────────────────────────────────────────
function buildCentralStation(mats: MachineMaterials): { station: Group; lamp: PointLight; antennaGlow: Mesh } {
  const station = new Group();
  // main electronics box – scaled up for visibility
  part(station, new BoxGeometry(1.4, 0.8, 1.1), mats.white, 0, 0.4, 0);
  // solar / thermal cover on top
  part(station, new BoxGeometry(1.35, 0.025, 1.05), mats.solar, 0, 0.815, 0);
  // antenna mast (pointing slightly toward Earth)
  tube(station, new Vector3(0, 0.82, 0), new Vector3(0.2, 2.1, 0), 0.045, mats.alu);
  // parabolic dish at top
  part(station, new CylinderGeometry(0.35, 0.05, 0.3, 16, 1, true), mats.alu, 0.22, 2.3, 0);
  const antennaHead = new Mesh(new SphereGeometry(0.14, 10, 8), mats.alu);
  antennaHead.position.set(0.22, 2.42, 0);
  station.add(antennaHead);
  // glowing signal orb (the "eye" / heartbeat indicator)
  const glowMat = new MeshStandardMaterial({
    color: 0x44aaff,
    emissive: 0x1166ff,
    emissiveIntensity: 1.2,
    roughness: 0.1,
    metalness: 0,
  });
  const antennaGlow = new Mesh(new SphereGeometry(0.07, 8, 6), glowMat);
  antennaGlow.position.set(0.22, 2.55, 0);
  station.add(antennaGlow);
  // 6 data-cable connectors around the base
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    part(station, new CylinderGeometry(0.028, 0.028, 0.09, 8), mats.dark,
      Math.cos(angle) * 0.65, 0.045, Math.sin(angle) * 0.65);
  }
  // point light for warm nuclear glow
  const lamp = new PointLight(0xffcc66, 0, 14, 2);
  lamp.position.set(0, 1.6, 0);
  station.add(lamp);
  return { station, lamp, antennaGlow };
}

// ─── ALSEP 6 instruments arrayed around origin ────────────────────────────────
const INSTRUMENT_DEFS = [
  { id: 'seismometer',  x:  5.5, z: -1.8, label: 'Seismometer',       color: 0x8888cc },
  { id: 'magnetometer', x: -4.5, z:  3.8, label: 'Magnetometer',      color: 0xcc8844 },
  { id: 'solarWind',    x:  1.5, z:  6.5, label: 'Solar Wind Spec.',  color: 0x88cc88 },
  { id: 'ionDetector',  x: -6.0, z: -1.5, label: 'Ion Detector',      color: 0xcc8888 },
  { id: 'dustDetector', x:  0.8, z: -6.5, label: 'Dust Detector',     color: 0xcccc88 },
  { id: 'ionGauge',     x:  7.5, z:  2.0, label: 'Cold Cathode Gauge',color: 0x88cccc },
] as const;

function buildInstruments(mats: MachineMaterials, objects: Record<string, Object3D>): void {
  INSTRUMENT_DEFS.forEach((def) => {
    const instr = new Group();
    // stake in ground
    part(instr, new CylinderGeometry(0.055, 0.055, 0.9, 8), mats.alu, 0, 0.45, 0);
    // sensor box – enlarged for visibility
    part(instr, new BoxGeometry(0.5, 0.32, 0.4), mats.white, 0, 1.06, 0);
    // coloured indicator lens
    const capMat = new MeshStandardMaterial({
      color: def.color,
      emissive: def.color,
      emissiveIntensity: 0.6,
      roughness: 0.3,
    });
    part(instr, new SphereGeometry(0.09, 8, 6), capMat, 0, 1.28, 0.18);
    // ribbon cable running back toward origin
    const dist = Math.sqrt(def.x ** 2 + def.z ** 2);
    const steps = Math.ceil(dist);
    for (let s = 0; s < steps; s++) {
      const t0 = s / steps;
      const t1 = (s + 1) / steps;
      tube(instr,
        new Vector3(def.x * t0 - def.x, 0.03, def.z * t0 - def.z),
        new Vector3(def.x * t1 - def.x, 0.03, def.z * t1 - def.z),
        0.018, mats.dark);
    }
    instr.position.set(def.x, 0, def.z);
    objects[def.id] = instr;
  });
}

// ─── Intrepid lander (descent + ascent stages) ────────────────────────────────
const DESCENT_W = 5.0;
const DESCENT_H = 2.0;
const FOOTPAD_SPAN = 5.5;
const ASCENT_H = 3.4;

function buildIntrepid(mats: MachineMaterials): { descent: Group; ascent: Group } {
  // Descent stage: octagonal body, 4 legs
  const descent = new Group();
  part(descent, new CylinderGeometry(DESCENT_W / 2, DESCENT_W / 2, DESCENT_H, 8), mats.gold, 0, DESCENT_H / 2, 0);
  // engine nozzle underneath
  part(descent, new CylinderGeometry(0.4, 0.75, 0.75, 12), mats.dark, 0, -0.37, 0);
  // 4 legs
  const legAngles = [45, 135, 225, 315];
  for (const angleDeg of legAngles) {
    const a = (angleDeg * Math.PI) / 180;
    const lx = Math.cos(a) * FOOTPAD_SPAN;
    const lz = Math.sin(a) * FOOTPAD_SPAN;
    tube(descent, new Vector3(Math.cos(a) * 2.5, 0.6, Math.sin(a) * 2.5),
      new Vector3(lx, -0.6, lz), 0.09, mats.alu);
    // cross-brace
    tube(descent, new Vector3(Math.cos(a) * 2.5, 0.6, Math.sin(a) * 2.5),
      new Vector3(lx, 0.2, lz), 0.055, mats.alu);
    // footpad disc
    part(descent, new CylinderGeometry(0.5, 0.5, 0.08, 14), mats.alu, lx, -0.6, lz);
  }

  // Ascent stage: smaller box cabin on top
  const ascent = new Group();
  part(ascent, new BoxGeometry(2.4, ASCENT_H * 0.7, 2.6), mats.white, 0, ASCENT_H * 0.35, 0);
  // docking hatch on top
  part(ascent, new CylinderGeometry(0.42, 0.42, 0.18, 12), mats.alu, 0, ASCENT_H * 0.7 + 0.09, 0);
  // two triangular windows
  for (const side of [-0.75, 0.75]) {
    part(ascent, new BoxGeometry(0.42, 0.34, 0.05), mats.dark, side, ASCENT_H * 0.46, 1.32);
  }
  // ascent engine bell
  part(ascent, new CylinderGeometry(0.28, 0.5, 0.5, 12), mats.alu, 0, -0.25, 0);
  // reaction control thrusters (4 clusters)
  for (const [tx, tz] of [[1.2, 1.2], [-1.2, 1.2], [1.2, -1.2], [-1.2, -1.2]]) {
    part(ascent, new CylinderGeometry(0.09, 0.12, 0.22, 8), mats.dark, tx, ASCENT_H * 0.55, tz);
  }
  ascent.position.y = DESCENT_H;
  descent.add(ascent);

  return { descent, ascent };
}

// ─── Surveyor 3 ───────────────────────────────────────────────────────────────
function buildSurveyor(mats: MachineMaterials): Group {
  const surv = new Group();
  // 3 legs
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    tube(surv, new Vector3(0, 1.1, 0),
      new Vector3(Math.cos(a) * 1.4, 0, Math.sin(a) * 1.4), 0.055, mats.alu);
    part(surv, new SphereGeometry(0.14, 8, 6), mats.alu,
      Math.cos(a) * 1.4, 0, Math.sin(a) * 1.4);
  }
  // body frame
  part(surv, new BoxGeometry(0.9, 0.5, 0.75), mats.white, 0, 1.25, 0);
  // solar panel
  part(surv, new BoxGeometry(1.8, 0.02, 0.9), mats.solar, 0, 1.6, 0).rotation.x = 0.2;
  // camera mount stub (camera was removed by astronauts)
  part(surv, new CylinderGeometry(0.05, 0.05, 0.25, 8), mats.dark, 0.38, 1.55, 0.25);
  // soil scoop arm stub
  tube(surv, new Vector3(-0.44, 1.2, 0), new Vector3(-0.75, 0.75, 0.38), 0.04, mats.alu);
  surv.position.set(SURVEYOR_X, SURVEYOR_Y, SURVEYOR_Z);
  return surv;
}

// ─── TV camera stub (tilted – burned by the Sun) ──────────────────────────────
function buildTVCamera(mats: MachineMaterials): Group {
  const tvCam = new Group();
  part(tvCam, new BoxGeometry(0.35, 0.28, 0.44), mats.dark);
  part(tvCam, new CylinderGeometry(0.09, 0.09, 0.16, 10), mats.dark, 0, 0, 0.3).rotation.x = Math.PI / 2;
  tvCam.rotation.x = Math.PI / 2;  // knocked over – burned lens faces the sky
  tvCam.position.set(INTREPID_X - 5, 0.14, INTREPID_Z + 3);
  return tvCam;
}

// ─── Footprint texture patches on the ground ─────────────────────────────────
function buildFootprints(scene: Group): void {
  const fpMat = new MeshStandardMaterial({ color: 0x444240, roughness: 1, metalness: 0 });
  const COUNT = 80;
  for (let i = 0; i < COUNT; i++) {
    const t = i / COUNT;
    const pathBlend = t < 0.5 ? 0 : (t - 0.5) * 2;
    const x = INTREPID_X * (1 - t) * (1 - pathBlend) + SURVEYOR_X * t * pathBlend;
    const z = INTREPID_Z * (1 - t) * (1 - pathBlend) + SURVEYOR_Z * t * pathBlend;
    const jx = (hash(i, 301) - 0.5) * 2.0;
    const jz = (hash(i, 303) - 0.5) * 2.0;
    const fp = new Mesh(new BoxGeometry(0.3, 0.005, 0.2), fpMat);
    fp.position.set(x + jx, 0.001, z + jz);
    fp.rotation.y = hash(i, 305) * Math.PI;
    scene.add(fp);
  }
}

// ─── Main scene build ─────────────────────────────────────────────────────────
export default function buildScene({ scene, materials }: SceneBuild): SceneHandles {
  const objects: Record<string, Object3D> = {};
  let ctx: EpisodeContext | null = null;

  // ALSEP Central Station (at origin – this IS the narrator's body)
  const { station, lamp: alsepLamp, antennaGlow } = buildCentralStation(materials);
  scene.add(station);
  objects['alsepStation'] = station;

  // RTG power generator
  const rtg = buildRTG(materials);
  scene.add(rtg);
  objects['rtg'] = rtg;

  // 6 science instruments
  buildInstruments(materials, objects);
  for (const def of INSTRUMENT_DEFS) {
    const instr = objects[def.id];
    if (instr) scene.add(instr);
  }

  // Intrepid lander
  const { descent, ascent } = buildIntrepid(materials);
  descent.position.set(INTREPID_X, 0, INTREPID_Z);
  scene.add(descent);
  objects['intrepidDescent'] = descent;
  objects['intrepidAscent'] = ascent;

  // TV camera stub
  const tvCam = buildTVCamera(materials);
  scene.add(tvCam);
  objects['tvCamera'] = tvCam;

  // Surveyor 3
  const surveyor = buildSurveyor(materials);
  scene.add(surveyor);
  objects['surveyor3'] = surveyor;

  // Footprints
  buildFootprints(scene as unknown as Group);

  // ─── State ───────────────────────────────────────────────────────────────
  let pulseTick = 0;
  let dayCycleActive = false;
  let dayCycleT = 0;

  // ─── Calls ────────────────────────────────────────────────────────────────
  const calls: SceneHandles['calls'] = {

    /** Act 1 initial state: everything present, signal alive. */
    boot() {
      ascent.visible = true;
      alsepLamp.intensity = 0.6;
      antennaGlow.visible = true;
      dayCycleActive = false;
      dayCycleT = 0;
    },

    /** Ascent stage fires and rises silently – no audio (vacuum). */
    async liftoff(_context, scope) {
      await scope.wait(gsap.to(ascent.position, {
        y: 60,
        duration: 5,
        ease: 'power1.in',
        onComplete() {
          ascent.visible = false;
        },
      }));
    },

    /** Camera micro-shake to simulate the moonquake felt through the ground. */
    async moonquakeShake(context, scope) {
      const { camera } = context;
      const shakes = 22;
      for (let i = 0; i < shakes; i++) {
        const mag = 0.018 * (1 - i / shakes);
        await scope.wait(gsap.to(camera.position, {
          x: camera.position.x + (Math.random() - 0.5) * mag,
          y: camera.position.y + (Math.random() - 0.5) * mag * 0.5,
          duration: 0.07,
          ease: 'none',
        }));
      }
    },

    /** Start the accelerated day/night cycle for Act 4. */
    dayCycle() {
      dayCycleActive = true;
    },

    /** Power the signal glow down slowly – called at shutdown. */
    async powerDown(_context, scope) {
      await scope.wait(gsap.to(alsepLamp, { intensity: 0, duration: 6, ease: 'power2.in' }));
      antennaGlow.visible = false;
    },

    /** Final shutdown: kill the lights. The director handles the DOM overlay. */
    finalShutdown(_context, scope) {
      void scope.wait(gsap.to(alsepLamp, { intensity: 0, duration: 7, ease: 'power1.in' }));
      gsap.to(antennaGlow.scale, { x: 0, y: 0, z: 0, duration: 5, ease: 'power2.in', onComplete() {
        antennaGlow.visible = false;
      } });
    },
  };

  return {
    machine: {
      root: station,
      body: station,
      bubbleHeight: 2.6,
      eyes: materials.lens,
      lamp: alsepLamp,
    } as unknown as MachineParts,
    objects,
    calls,
    onReady(context) {
      ctx = context;
      context.machine.groundAt = () => 0;
      context.machine.leavesTracksAt = () => false;
    },
    update(dt, time) {
      // Pulse the antenna glow to simulate telemetry heartbeat
      pulseTick += dt;
      if (antennaGlow.visible) {
        const pulse = 0.6 + 0.5 * Math.sin(pulseTick * 2.8);
        const mat = antennaGlow.material as MeshStandardMaterial;
        mat.emissiveIntensity = pulse;
      }

      // Accelerated day/night visual (cycle the ambient-like point light)
      if (dayCycleActive && ctx) {
        dayCycleT += dt * 0.4;
        const dayBrightness = Math.max(0, Math.sin(dayCycleT * Math.PI));
        alsepLamp.intensity = 0.2 + dayBrightness * 0.8;
      }

      void time;
      void ctx;
    },
  };
}
