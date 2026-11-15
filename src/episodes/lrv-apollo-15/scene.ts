/**
 * Apollo 15 at Hadley: the Lunar Roving Vehicle (built here: NASA 3D Resources has no LRV model),
 * NASA's Lunar Module as Falcon, the Apennine mountains and Hadley Rille.
 * Calls: folded, unfold, parked, liftoff, drop (the hammer and the feather).
 */
import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from 'three';
import type { Object3D } from 'three';
import gsap from 'gsap';
import { part, tube, type MachineMaterials, type MachineParts } from '../../engine/models';
import type { Scope } from '../../engine/scope';
import type { SceneBuild, SceneHandles } from '../../engine/types';
import { createRockMaterial, rockGeometry } from '../../engine/worlds/mars';
import { nasaModel, splitAbove } from '../../journey/nasaModels';

export const ROVER = { x: 0, z: 0, heading: -0.4 } as const;
export const FALCON = { x: 7, z: -5 };
/** Drive targets on the way to the rille edge. */
export const CHECKPOINTS: [number, number, number][] = [
  [-8, 0, 4],
  [-16, 0, -4],
  [-22, 0, 6],
];
const MOON_G = 1.62;
const DROP_FROM = 1.5;

interface Rover {
  parts: MachineParts;
  wheels: Group[];
}

function buildRover(mats: MachineMaterials): Rover {
  const root = new Group();
  const body = new Group();
  root.add(body);
  // drawn at 70% so the driving camera can see the road ahead
  body.scale.setScalar(0.7);
  const frame = new MeshStandardMaterial({ color: 0xb9b7b0, roughness: 0.5, metalness: 0.6 });
  // chassis and floor
  part(body, new BoxGeometry(2.6, 0.08, 1.2), frame, 0, 0.45, 0);
  part(body, new BoxGeometry(2.4, 0.03, 1.1), mats.alu, 0, 0.5, 0);
  // two seats
  const seat = new MeshStandardMaterial({ color: 0x6d6a62, roughness: 0.9 });
  for (const z of [-0.28, 0.28]) {
    part(body, new BoxGeometry(0.45, 0.06, 0.42), seat, -0.1, 0.62, z);
    part(body, new BoxGeometry(0.06, 0.45, 0.42), seat, -0.33, 0.83, z);
  }
  // console with the hand controller between the seats
  part(body, new BoxGeometry(0.25, 0.35, 0.3), mats.dark, 0.45, 0.72, 0);
  // umbrella high-gain antenna and the TV camera at the front
  tube(body, new Vector3(1.05, 0.5, 0.35), new Vector3(1.05, 1.55, 0.35), 0.02, mats.alu);
  const dish = new Mesh(new ConeGeometry(0.45, 0.22, 16, 1, true), new MeshStandardMaterial({ color: 0xe8e6e0, roughness: 0.5, side: 2 }));
  dish.position.set(1.05, 1.6, 0.35);
  dish.rotation.z = Math.PI;
  body.add(dish);
  tube(body, new Vector3(1.15, 0.5, -0.3), new Vector3(1.15, 1.05, -0.3), 0.02, mats.alu);
  part(body, new BoxGeometry(0.22, 0.14, 0.14), mats.white, 1.2, 1.1, -0.3);
  const eyes = mats.lens.clone();
  part(body, new CylinderGeometry(0.04, 0.04, 0.06, 12), eyes, 1.33, 1.1, -0.3).rotation.z = Math.PI / 2;
  // four wire-mesh wheels with fenders
  const wheels: Group[] = [];
  const tyre = new MeshStandardMaterial({ color: 0x9a9890, roughness: 0.6, metalness: 0.5, wireframe: true });
  const fender = new MeshStandardMaterial({ color: 0xc9a43a, roughness: 0.6 });
  for (const x of [-1.05, 1.05]) {
    for (const z of [-0.75, 0.75]) {
      const wheel = new Group();
      wheel.position.set(x, 0.32, z);
      const t = new Mesh(new TorusGeometry(0.26, 0.07, 8, 20), tyre);
      wheel.add(t);
      part(wheel, new CylinderGeometry(0.08, 0.08, 0.16, 10), mats.alu).rotation.x = Math.PI / 2;
      body.add(wheel);
      wheels.push(wheel);
      const f = part(body, new CylinderGeometry(0.36, 0.36, 0.2, 16, 1, true, 0, Math.PI), fender, x, 0.32, z);
      f.rotation.x = Math.PI / 2;
      f.rotation.z = Math.PI / 2;
    }
  }
  return { parts: { root, body, bubbleHeight: 1.2, eyes, wheels, wheelRadius: 0.22, trackHalfWidth: 0.52 }, wheels };
}

const tween = (scope: Scope, target: object, vars: gsap.TweenVars): Promise<void> =>
  new Promise((resolve) => {
    const t = gsap.to(target, { ...vars, onComplete: resolve, onInterrupt: resolve });
    scope.add(() => t.kill());
  });

export default async function buildScene({ scene, world, materials, anisotropy }: SceneBuild): Promise<SceneHandles> {
  const ground = (x: number, z: number): number => world.heightAt(x, z);
  const rover = buildRover(materials);
  const objects: Record<string, Object3D> = {};

  // Falcon: NASA's Lunar Module, its top half can lift off
  const falcon = new Group();
  falcon.position.set(FALCON.x, ground(FALCON.x, FALCON.z), FALCON.z);
  falcon.rotation.y = -0.8;
  scene.add(falcon);
  const lm = await nasaModel('apollo-lunar-module', { size: 7, by: 'height' });
  let ascent: Group | null = null;
  if (lm) {
    falcon.add(lm);
    ascent = splitAbove(lm, 0.42);
  }
  objects.falcon = falcon;

  // the Apennine front: big soft mountains far away
  const hillMat = new MeshStandardMaterial({ color: 0x77736d, roughness: 1 });
  [
    [140, -220, 70],
    [260, -160, 90],
    [20, -260, 60],
    [330, -40, 64],
  ].forEach(([x, z, h]) => {
    // wide, rounded massifs: the Apennine front seen across the mare
    const hill = part(scene, new SphereGeometry(h * 2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), hillMat, x, -6, z);
    hill.scale.set(1.3, 0.45, 0.9);
  });
  // Hadley Rille: a long dark channel to the west
  const rille = new Mesh(new PlaneGeometry(14, 220), new MeshStandardMaterial({ color: 0x2a2826, roughness: 1 }));
  rille.rotation.x = -Math.PI / 2;
  rille.rotation.z = 0.25;
  rille.position.set(-34, ground(-34, 0) + 0.05, 0);
  scene.add(rille);
  objects.rille = rille;

  // the hammer and the feather, for the famous drop
  const hammer = new Group();
  part(hammer, new BoxGeometry(0.05, 0.4, 0.05), materials.dark, 0, 0, 0);
  part(hammer, new BoxGeometry(0.18, 0.08, 0.08), materials.alu, 0, 0.2, 0);
  const feather = new Group();
  const plume = part(feather, new PlaneGeometry(0.08, 0.32), new MeshStandardMaterial({ color: 0xf5f2ea, side: 2 }), 0, 0, 0);
  plume.rotation.y = 0.5;
  const dropAt = new Vector3(-2.4, 0, 2.2);
  hammer.position.set(dropAt.x - 0.25, 0, dropAt.z);
  feather.position.set(dropAt.x + 0.25, 0, dropAt.z);
  hammer.visible = feather.visible = false;
  scene.add(hammer, feather);
  objects.hammer = hammer;

  // sample rocks near the foot of the mountains
  const rockMat = createRockMaterial(anisotropy, 0x8f8b85);
  ['index', 'dune', 'spur'].forEach((name, i) => {
    const x = 5 + i * 3.2;
    const z = 4 + (i % 2) * 2.5;
    const rock = part(scene, rockGeometry(90 + i, 1), rockMat, x, ground(x, z) + 0.15, z);
    rock.scale.set(0.32, 0.22, 0.26);
    rock.rotation.y = i;
    objects[name] = rock;
  });

  const folded = (on: boolean): void => {
    for (const w of rover.wheels) w.scale.setScalar(on ? 0.3 : 1);
    rover.parts.body.scale.set(on ? 0.42 : 0.7, 0.7, on ? 0.42 : 0.7);
  };

  return {
    machine: rover.parts,
    objects,
    calls: {
      /** Still folded against Falcon's side. */
      folded(c) {
        folded(true);
        if (ascent) ascent.visible = true;
        gsap.killTweensOf(ascent?.position ?? {});
        ascent?.position.set(0, 0, 0);
        c.machine.root.visible = true;
      },
      /** Unfold: the chassis opens and the wheels spring out. */
      async unfold(c, scope) {
        c.audio.play('servo');
        const s = { k: 0 };
        await tween(scope, s, {
          k: 1,
          duration: 2.4,
          ease: 'back.out(1.6)',
          onUpdate: () => {
            for (const w of rover.wheels) w.scale.setScalar(0.3 + 0.7 * s.k);
            rover.parts.body.scale.set(0.42 + 0.28 * s.k, 0.7, 0.42 + 0.28 * s.k);
          },
        });
        c.audio.play('thud');
      },
      parked() {
        folded(false);
        if (ascent) {
          gsap.killTweensOf(ascent.position);
          ascent.position.set(0, 0, 0);
          ascent.visible = true;
        }
      },
      /** Falcon's top half leaves; the rover stays behind for good. */
      async liftoff(c, scope) {
        if (!ascent) return;
        c.audio.play('hiss');
        c.fx.burst('moonDust', new Vector3(FALCON.x, ground(FALCON.x, FALCON.z) + 0.2, FALCON.z));
        await tween(scope, ascent.position, { y: 60, duration: 6, ease: 'power1.in' });
        ascent.visible = false;
      },
      /** The hammer and the feather fall side by side: no air on the Moon to slow the feather. */
      async drop(c, scope) {
        const y0 = ground(dropAt.x, dropAt.z);
        hammer.visible = feather.visible = true;
        hammer.position.y = feather.position.y = y0 + DROP_FROM;
        const fall = Math.sqrt((2 * DROP_FROM) / MOON_G);
        await Promise.all([
          tween(scope, hammer.position, { y: y0 + 0.05, duration: fall, ease: 'power2.in' }),
          tween(scope, feather.position, { y: y0 + 0.02, duration: fall, ease: 'power2.in' }),
        ]);
        c.audio.play('thud');
        c.fx.burst('moonDust', new Vector3(dropAt.x, y0, dropAt.z));
      },
    },
  };
}
