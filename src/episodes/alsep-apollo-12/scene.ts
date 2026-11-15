/**
 * Apollo 12 ALSEP scene. The narrator is the ALSEP central station.
 *
 * Moon layout (1 unit = 1 m, north = -Z, east = +X). The station and its instruments are drawn
 * larger than life so a child can see them; distances are squeezed so everything fits one view.
 *   ALSEP central station (0, 0)     SNAP-27 RTG (2, 1)     six instruments in a ring
 *   Intrepid (NASA Apollo Lunar Module model) (INTREPID_X, INTREPID_Z)
 *   Surveyor 3 (SURVEYOR_X, SURVEYOR_Z)
 * Earth stage: NASA's Saturn V model on the pad, for the launch memory.
 *
 * Calls: launchPose, launch, landed, liftoff, longWatch.
 */
import {
  BoxGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PointLight,
  QuadraticBezierCurve3,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from 'three';
import type { Object3D } from 'three';
import gsap from 'gsap';
import { part, tube, type MachineMaterials } from '../../engine/models';
import { hash } from '../../engine/noise';
import type { Scope } from '../../engine/scope';
import type { SceneBuild, SceneHandles } from '../../engine/types';
import { nasaModel, splitAbove } from '../../journey/nasaModels';

export const INTREPID_X = 14;
export const INTREPID_Z = -10;
export const SURVEYOR_X = 22;
export const SURVEYOR_Z = 14;
const SURVEYOR_Y = 0;
/** NASA: the Lunar Module stood about 7 m tall; the model is fitted to that height. */
const LM_HEIGHT = 7;
/** Share of the model's height below which parts belong to the descent stage. */
const DESCENT_SHARE = 0.42;
const SATURN_HEIGHT = 60;

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

/** NASA's Lunar Module, split in two so the ascent stage can lift off. Falls back to the stand-in. */
async function buildLunarModule(mats: MachineMaterials, scene: Object3D, groundY: number): Promise<{ lm: Group; ascent: Group }> {
  const lm = new Group();
  lm.position.set(INTREPID_X, groundY, INTREPID_Z);
  lm.rotation.y = -0.6;
  scene.add(lm);
  const model = await nasaModel('apollo-lunar-module', { size: LM_HEIGHT, by: 'height' });
  if (!model) {
    const { descent, ascent } = buildIntrepid(mats);
    lm.add(descent);
    return { lm, ascent };
  }
  lm.add(model);
  return { lm, ascent: splitAbove(model, DESCENT_SHARE) };
}

/** A rocket flame: an open cone glowing brighter than white. */
function flame(radius: number, length: number, color: number): Mesh {
  const mat = new MeshBasicMaterial({ color: new Color(color).multiplyScalar(3), transparent: true, opacity: 0.85, depthWrite: false });
  const mesh = new Mesh(new ConeGeometry(radius, length, 24, 1, true), mat);
  mesh.rotation.x = Math.PI;
  mesh.visible = false;
  return mesh;
}

/** Run a gsap tween inside a scope: it stops when the page is skipped. */
function play(scope: Scope, vars: gsap.TweenVars & { target: object }): Promise<void> {
  const { target, ...rest } = vars;
  const tween = gsap.to(target, rest);
  scope.add(() => tween.kill());
  return new Promise((resolve) => {
    tween.eventCallback('onComplete', () => resolve());
    tween.eventCallback('onInterrupt', () => resolve());
  });
}

export default async function buildScene({ scene, world, materials, stage }: SceneBuild): Promise<SceneHandles> {
  const objects: Record<string, Object3D> = {};
  const ground = (x: number, z: number): number => world.heightAt(x, z);

  // ---------- Moon: the station ----------
  const { station, lamp, antennaGlow } = buildCentralStation(materials);
  const body = new Group();
  body.add(station);
  const root = new Group();
  root.add(body);
  scene.add(root);
  objects.alsepStation = station;

  const rtg = buildRTG(materials);
  rtg.position.y = ground(rtg.position.x, rtg.position.z);
  scene.add(rtg);
  objects.rtg = rtg;

  buildInstruments(materials, objects);
  for (const def of INSTRUMENT_DEFS) {
    const instrument = objects[def.id];
    instrument.position.y = ground(def.x, def.z);
    scene.add(instrument);
  }

  const surveyor = buildSurveyor(materials);
  surveyor.position.y = ground(SURVEYOR_X, SURVEYOR_Z) + SURVEYOR_Y;
  scene.add(surveyor);
  objects.surveyor3 = surveyor;

  const tvCamera = buildTVCamera(materials);
  tvCamera.position.y += ground(tvCamera.position.x, tvCamera.position.z);
  scene.add(tvCamera);
  objects.tvCamera = tvCamera;
  buildFootprints(scene as unknown as Group);

  const { lm, ascent } = await buildLunarModule(materials, scene, ground(INTREPID_X, INTREPID_Z));
  const ascentFlame = flame(0.5, 3, 0xffc070);
  ascentFlame.position.y = LM_HEIGHT * DESCENT_SHARE - 1;
  ascent.add(ascentFlame);
  const ascentLight = new PointLight(0xffb060, 0, 60, 1.6);
  ascentLight.position.y = LM_HEIGHT * DESCENT_SHARE - 1.5;
  ascent.add(ascentLight);
  objects.intrepid = lm;
  objects.intrepidAscent = ascent;

  // ---------- Earth: the Saturn V on the pad ----------
  const earth = stage('earth');
  const rocket = new Group();
  earth.scene.add(rocket);
  const saturn = await nasaModel('saturn-v', { size: SATURN_HEIGHT, by: 'height' });
  if (saturn) rocket.add(saturn);
  else part(rocket, new CylinderGeometry(2, 2, SATURN_HEIGHT, 24), materials.white, 0, SATURN_HEIGHT / 2, 0);
  const engines = new Group();
  for (let k = 0; k < 5; k++) {
    const f = flame(1.1, 14, 0xffa040);
    const a = (k / 4) * Math.PI * 2;
    f.position.set(k === 4 ? 0 : Math.cos(a) * 1.6, -7, k === 4 ? 0 : Math.sin(a) * 1.6);
    engines.add(f);
  }
  rocket.add(engines);
  const exhaust = new PointLight(0xff8a30, 0, 200, 1.4);
  exhaust.position.y = -5;
  rocket.add(exhaust);
  objects.saturn = rocket;

  const tmp = new Vector3();

  const calls: SceneHandles['calls'] = {
    launchPose() {
      gsap.killTweensOf(rocket.position);
      rocket.position.set(0, 0, 0);
      exhaust.intensity = 0;
      for (const f of engines.children) f.visible = false;
    },

    async launch(c, scope) {
      for (const f of engines.children) f.visible = true;
      c.audio.play('ignition');
      c.audio.play('whoosh');
      c.comic.sfx(c.t('sfx.liftoff'));
      for (let k = 0; k < 12; k++) c.fx.burst('smoke', tmp.set((Math.random() - 0.5) * 18, 1, (Math.random() - 0.5) * 18));
      let puff = 0;
      scope.frame((dt, time) => {
        for (const f of engines.children) f.scale.set(1, 1 + Math.sin(time * 40 + f.id) * 0.12, 1);
        exhaust.intensity = 1200 + Math.sin(time * 33) * 300;
        puff += dt;
        if (puff > 0.08 && rocket.position.y < 220) {
          puff = 0;
          c.fx.burst('smoke', tmp.set((Math.random() - 0.5) * 4, rocket.position.y - 6, (Math.random() - 0.5) * 4));
        }
        const shake = Math.max(0, 1 - rocket.position.y / 140) * 0.4;
        c.director.shot({
          pos: [80 + Math.sin(time * 61) * shake, Math.max(12, rocket.position.y * 0.5 + 12) + Math.cos(time * 53) * shake, 105],
          look: [0, rocket.position.y + 30, 0],
        });
        c.audio.rocket(Math.max(0.35, 1 - rocket.position.y / 320));
      });
      scope.add(() => {
        c.audio.rocket(0);
        exhaust.intensity = 0;
      });
      await play(scope, { target: rocket.position, y: 320, duration: 7, ease: 'power2.in' });
    },

    /** Every Moon page starts here: Intrepid whole again (the child may have skipped back). */
    landed() {
      gsap.killTweensOf(ascent.position);
      ascent.position.set(0, 0, 0);
      ascent.visible = true;
      ascentFlame.visible = false;
      ascentLight.intensity = 0;
    },

    /** The ascent stage rises on its own engine; the descent stage stays as the launch pad. */
    async liftoff(c, scope) {
      ascentFlame.visible = true;
      ascentLight.intensity = 30;
      c.comic.sfx(c.t('sfx.liftoff'));
      c.audio.play('whoosh');
      for (let k = 0; k < 6; k++) {
        c.fx.burst('moonDust', tmp.set(INTREPID_X + (Math.random() - 0.5) * 6, ground(INTREPID_X, INTREPID_Z) + 0.1, INTREPID_Z + (Math.random() - 0.5) * 6));
      }
      scope.frame((_dt, time) => ascentFlame.scale.set(1, 1 + Math.sin(time * 45) * 0.15, 1));
      scope.add(() => {
        ascentFlame.visible = false;
        ascentLight.intensity = 0;
      });
      await play(scope, { target: ascent.position, y: 80, duration: 6, ease: 'power1.in' });
      ascent.visible = false;
    },

    /** After the liftoff page: only the descent stage is left. */
    liftoffDone() {
      ascent.visible = false;
    },

    /** Lunar days and nights race past while the hours are counted. */
    longWatch(c, scope) {
      scope.frame((_dt, time) => {
        c.sky.state.day = 0.5 + 0.5 * Math.cos(time * 0.9);
        c.sky.state.az = time * 0.45;
      });
    },
  };

  return {
    machine: { root, body, bubbleHeight: 2.6, eyes: antennaGlow.material as MeshStandardMaterial, lamp },
    objects,
    calls,
  };
}
