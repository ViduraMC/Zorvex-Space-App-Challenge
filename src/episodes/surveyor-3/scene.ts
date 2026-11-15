/**
 * Surveyor 3 in Oceanus Procellarum (NASA 3D Resources has no Surveyor model, so it is built here:
 * a triangular frame on three legs, a tall mast with the solar panel and flat antenna, the TV camera
 * under its mirror, and the surface sampler arm). Intrepid (NASA's Lunar Module) arrives in 1969.
 * Calls: arrive, bounce, landed, dig, night, visit.
 */
import { BoxGeometry, CircleGeometry, ConeGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import type { Object3D } from 'three';
import gsap from 'gsap';
import { part, tube, type MachineMaterials, type MachineParts } from '../../engine/models';
import type { Scope } from '../../engine/scope';
import type { SceneBuild, SceneHandles } from '../../engine/types';
import { nasaModel } from '../../journey/nasaModels';

export const LANDER = { x: 0, z: 0, heading: 0 } as const;
/** Where the sampler digs, in front of the lander. */
export const TRENCHES: [number, number, number][] = [
  [0.88, 0, -0.44],
  [1.24, 0, -0.01],
];
/** Scoop yaw that puts the scoop over each trench (the arm swings sideways between digs). */
const TRENCH_YAW = [1.1, 0.3];
const INTREPID_AT = { x: 14, z: -10 };

function buildSurveyor(mats: MachineMaterials): { parts: MachineParts; scoop: Group; camera: Group } {
  const root = new Group();
  const body = new Group();
  root.add(body);
  // triangular space frame with three legs and crushable footpads
  const corners: Vector3[] = [];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    corners.push(new Vector3(Math.cos(a) * 0.75, 0.55, Math.sin(a) * 0.75));
  }
  for (let i = 0; i < 3; i++) {
    tube(body, corners[i], corners[(i + 1) % 3], 0.03, mats.alu);
    const foot = corners[i].clone().multiplyScalar(1.7).setY(0.05);
    tube(body, corners[i], foot, 0.035, mats.alu);
    part(body, new CylinderGeometry(0.16, 0.18, 0.08, 14), mats.white, foot.x, 0.04, foot.z);
  }
  // equipment boxes and the main retro engine nozzle
  part(body, new BoxGeometry(0.4, 0.28, 0.32), mats.white, 0.1, 0.72, 0.15);
  part(body, new BoxGeometry(0.36, 0.26, 0.3), mats.gold, -0.18, 0.7, -0.2);
  part(body, new ConeGeometry(0.16, 0.3, 14, 1, true), mats.dark, 0, 0.42, 0).rotation.x = Math.PI;
  // mast with the solar panel and the flat antenna
  tube(body, new Vector3(0, 0.6, 0), new Vector3(0, 1.75, 0), 0.025, mats.alu);
  const panel = part(body, new BoxGeometry(0.85, 0.02, 0.55), mats.solar, 0.1, 1.8, 0);
  panel.rotation.z = 0.35;
  const antenna = part(body, new BoxGeometry(0.6, 0.02, 0.6), mats.white, -0.1, 1.55, 0.25);
  antenna.rotation.x = -0.6;
  // the TV camera: an upright cylinder with its mirror hood
  const camera = new Group();
  body.add(camera);
  part(camera, new CylinderGeometry(0.07, 0.07, 0.38, 14), mats.white, 0.45, 0.95, -0.25);
  const eyes = mats.lens.clone();
  part(camera, new CylinderGeometry(0.075, 0.075, 0.1, 14), eyes, 0.45, 1.18, -0.25);
  // the surface sampler: a folding arm with a scoop
  const scoop = new Group();
  scoop.position.set(0.55, 0.55, 0.2);
  body.add(scoop);
  tube(scoop, new Vector3(0, 0, 0), new Vector3(0.8, 0.05, 0), 0.025, mats.alu);
  part(scoop, new BoxGeometry(0.12, 0.08, 0.1), mats.alu, 0.85, 0.03, 0);
  scoop.rotation.y = 0.9;
  scoop.rotation.z = 0.5;
  return { parts: { root, body, bubbleHeight: 2, eyes }, scoop, camera };
}

const tween = (scope: Scope, target: object, vars: gsap.TweenVars): Promise<void> =>
  new Promise((resolve) => {
    const t = gsap.to(target, { ...vars, onComplete: resolve, onInterrupt: resolve });
    scope.add(() => t.kill());
  });

export default async function buildScene({ scene, world, materials }: SceneBuild): Promise<SceneHandles> {
  const ground = (x: number, z: number): number => world.heightAt(x, z);
  const lander = buildSurveyor(materials);
  const objects: Record<string, Object3D> = {};

  // trenches dug by the sampler: dark patches that appear one by one
  const trenchMat = new MeshStandardMaterial({ color: 0x1a1917, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 });
  const trenches = TRENCHES.map(([x, , z], i) => {
    const t = new Mesh(new CircleGeometry(0.26, 14), trenchMat);
    t.rotation.set(-Math.PI / 2, 0, TRENCH_YAW[i]);
    t.scale.set(1.6, 0.6, 1);
    t.position.set(x, ground(x, z) + 0.01, z);
    t.visible = false;
    scene.add(t);
    objects[`trench${i}`] = t;
    return t;
  });

  // Intrepid, the Apollo 12 lander that came to visit
  const intrepid = new Group();
  intrepid.position.set(INTREPID_AT.x, ground(INTREPID_AT.x, INTREPID_AT.z), INTREPID_AT.z);
  intrepid.rotation.y = -0.5;
  scene.add(intrepid);
  const lm = await nasaModel('apollo-lunar-module', { size: 7, by: 'height' });
  if (lm) intrepid.add(lm);
  intrepid.visible = false;
  objects.intrepid = intrepid;

  const reset = (): void => {
    gsap.killTweensOf(lander.scoop.rotation);
    lander.scoop.rotation.set(0, 0.9, 0.5);
    lander.scoop.visible = lander.camera.visible = true;
  };

  return {
    machine: lander.parts,
    objects,
    calls: {
      arrive(c) {
        reset();
        for (const t of trenches) t.visible = false;
        intrepid.visible = false;
        c.machine.lift = 14;
      },
      /** The engine fails to cut off: two big bounces before the third, soft touchdown. */
      async bounce(c, scope) {
        c.audio.rocket(0.4);
        scope.add(() => c.audio.rocket(0));
        await tween(scope, c.machine, { lift: 0, duration: 2.2, ease: 'power2.in' });
        for (const height of [10, 3]) {
          c.audio.play('boing');
          c.fx.burst('moonDust', c.resolve('machine'));
          await tween(scope, c.machine, { lift: height, duration: Math.sqrt((2 * height) / 1.62) * 0.55, ease: 'power2.out' });
          await tween(scope, c.machine, { lift: 0, duration: Math.sqrt((2 * height) / 1.62) * 0.55, ease: 'power2.in' });
        }
        c.audio.rocket(0);
        c.audio.play('thud');
        c.fx.burst('moonDust', c.resolve('machine'));
      },
      landed(c) {
        reset();
        c.machine.lift = 0;
        intrepid.visible = false;
      },
      /** The sampler scoops: swing down, dig, and leave a trench. */
      async dig(c, scope) {
        const i = Math.max(0, trenches.findIndex((t) => !t.visible));
        const next = trenches[i];
        c.audio.play('servo');
        await tween(scope, lander.scoop.rotation, { y: TRENCH_YAW[i], duration: 0.8, ease: 'sine.inOut' });
        await tween(scope, lander.scoop.rotation, { z: -0.6, duration: 1, ease: 'sine.inOut' });
        next.visible = true;
        c.fx.burst('moonDust', next.position);
        c.audio.play('servo');
        await tween(scope, lander.scoop.rotation, { z: 0.5, duration: 1, ease: 'sine.inOut' });
      },
      showTrenches() {
        for (const t of trenches) t.visible = true;
      },
      /** Two and a half years later: Intrepid stands nearby. */
      visit(c) {
        for (const t of trenches) t.visible = true;
        // the astronauts took the scoop and the camera home
        lander.scoop.visible = lander.camera.visible = false;
        intrepid.visible = true;
        c.machine.lift = 0;
      },
    },
  };
}
