/**
 * Phoenix on the Martian arctic plain. NASA 3D Resources has no Phoenix model, so the lander is
 * built here from the NSSDCA description: an octagonal base on three legs, two octagonal solar
 * wings, a 2 m camera mast, a weather mast, a 2.5 m robotic arm, and the TEGA ovens and MECA lab
 * on the deck. The plain has the polygon troughs seen in the first pictures; ice waits under the soil.
 * Calls: arrive, descend, landed, unfurl, ready, dig, vanish.
 */
import {
  BoxGeometry,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SphereGeometry,
  Vector3,
} from 'three';
import type { Object3D } from 'three';
import gsap from 'gsap';
import { part, tube, type MachineMaterials, type MachineParts } from '../../engine/models';
import type { Scope } from '../../engine/scope';
import type { SceneBuild, SceneHandles } from '../../engine/types';

export const LANDER = { x: 0, z: 0, heading: 0 } as const;
/** Where the arm digs (in front of the lander). */
export const TRENCH = { x: 1.9, z: 0.4 };
const DROP_HEIGHT = 6;

interface Lander {
  parts: MachineParts;
  wings: Group[];
  arm: Group;
  forearm: Group;
  chute: Group;
  flames: Mesh[];
}

function buildLander(mats: MachineMaterials): Lander {
  const root = new Group();
  const body = new Group();
  root.add(body);
  // octagonal base on three legs
  part(body, new CylinderGeometry(0.75, 0.75, 0.3, 8), mats.gold, 0, 0.75, 0);
  part(body, new CylinderGeometry(0.76, 0.76, 0.03, 8), mats.white, 0, 0.91, 0);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const foot = new Vector3(Math.cos(a) * 1.05, 0.03, Math.sin(a) * 1.05);
    tube(body, new Vector3(Math.cos(a) * 0.55, 0.65, Math.sin(a) * 0.55), foot, 0.04, mats.alu);
    part(body, new CylinderGeometry(0.13, 0.13, 0.04, 14), mats.alu, foot.x, 0.02, foot.z);
  }
  // two octagonal solar wings that unfold from the sides
  const wings: Group[] = [];
  for (const side of [-1, 1]) {
    const wing = new Group();
    wing.position.set(0, 0.88, side * 0.78);
    const panel = part(wing, new CylinderGeometry(0.95, 0.95, 0.02, 8), mats.solar, 0, 0, side * 0.95);
    panel.rotation.y = Math.PI / 8;
    part(wing, new CylinderGeometry(0.05, 0.05, 0.03, 8), mats.alu, 0, 0.01, side * 0.95);
    body.add(wing);
    wings.push(wing);
  }
  // camera mast (2 m) with the stereo camera's two eyes
  tube(body, new Vector3(-0.35, 0.92, -0.25), new Vector3(-0.35, 2, -0.25), 0.03, mats.alu);
  const eyes = mats.lens.clone();
  part(body, new BoxGeometry(0.2, 0.12, 0.26), mats.white, -0.35, 2.05, -0.25);
  for (const z of [-0.33, -0.17]) {
    const eye = part(body, new SphereGeometry(0.035, 12, 8), eyes, -0.25, 2.06, z);
    eye.scale.set(0.6, 1, 1);
  }
  // weather mast
  tube(body, new Vector3(0.4, 0.92, -0.45), new Vector3(0.4, 1.95, -0.45), 0.015, mats.alu);
  part(body, new SphereGeometry(0.04, 10, 8), mats.white, 0.4, 1.97, -0.45);
  // deck instruments: the TEGA ovens (a row of small doors) and the MECA lab box
  const tega = part(body, new BoxGeometry(0.45, 0.18, 0.28), mats.white, 0.15, 1.02, 0.25);
  tega.name = 'tega';
  for (let i = 0; i < 4; i++) part(body, new BoxGeometry(0.08, 0.02, 0.06), mats.dark, 0.0 + i * 0.1, 1.12, 0.25);
  const meca = part(body, new BoxGeometry(0.3, 0.2, 0.25), mats.gold, -0.3, 1.03, 0.3);
  meca.name = 'meca';
  // the 2.5 m robotic arm: shoulder, upper arm, forearm and scoop
  const arm = new Group();
  arm.position.set(0.55, 0.95, 0.1);
  body.add(arm);
  part(arm, new BoxGeometry(1.1, 0.07, 0.07), mats.white, 0.55, 0, 0);
  const forearm = new Group();
  forearm.position.set(1.1, 0, 0);
  arm.add(forearm);
  part(forearm, new BoxGeometry(1.0, 0.06, 0.06), mats.white, 0.5, 0, 0);
  part(forearm, new BoxGeometry(0.16, 0.1, 0.12), mats.alu, 1.02, -0.04, 0);
  arm.rotation.z = 0.9;
  forearm.rotation.z = -2.3;
  // parachute and landing thrusters (shown only while landing)
  const chute = new Group();
  const canopy = new Mesh(
    new SphereGeometry(1.6, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    new MeshStandardMaterial({ color: 0xf2efe6, roughness: 0.8, side: 2 }),
  );
  canopy.position.y = 5;
  chute.add(canopy);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    tube(chute, new Vector3(Math.cos(a) * 1.55, 5, Math.sin(a) * 1.55), new Vector3(0, 1.1, 0), 0.008, mats.alu);
  }
  chute.visible = false;
  root.add(chute);
  const flames: Mesh[] = [];
  const flameMat = new MeshBasicMaterial({ color: new Color(0xffc070).multiplyScalar(2.5), transparent: true, opacity: 0.8, depthWrite: false });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const f = new Mesh(new ConeGeometry(0.06, 0.5, 10, 1, true), flameMat);
    f.rotation.x = Math.PI;
    f.position.set(Math.cos(a) * 0.6, 0.35, Math.sin(a) * 0.6);
    f.visible = false;
    body.add(f);
    flames.push(f);
  }
  return { parts: { root, body, bubbleHeight: 2.3, eyes }, wings, arm, forearm, chute, flames };
}

/** The polygon troughs of the arctic plain: shallow dark lines on the ground. */
function troughs(scene: Object3D, ground: (x: number, z: number) => number): void {
  const mat = new MeshStandardMaterial({ color: 0x5a3626, roughness: 1, transparent: true, opacity: 0.3 });
  for (let i = -4; i <= 4; i++) {
    for (const along of [true, false]) {
      const line = new Mesh(new PlaneGeometry(along ? 30 : 0.25, along ? 0.25 : 30), mat);
      line.rotation.x = -Math.PI / 2;
      const off = i * 3.4 + 1.7;
      line.position.set(along ? 0 : off, ground(along ? 0 : off, along ? off : 0) + 0.015, along ? off : 0);
      line.rotation.z = 0.12;
      scene.add(line);
    }
  }
}

const play = (scope: Scope, target: object, vars: gsap.TweenVars): Promise<void> =>
  new Promise((resolve) => {
    const tween = gsap.to(target, { ...vars, onComplete: resolve, onInterrupt: resolve });
    scope.add(() => tween.kill());
  });

export default function buildScene({ scene, world, materials }: SceneBuild): SceneHandles {
  const ground = (x: number, z: number): number => world.heightAt(x, z);
  const lander = buildLander(materials);
  troughs(scene, ground);

  // the trench: dark freshly dug soil, with bright ice clumps that vanish over four sols
  const trench = new Group();
  trench.position.set(TRENCH.x, ground(TRENCH.x, TRENCH.z) + 0.01, TRENCH.z);
  scene.add(trench);
  const dug = new Mesh(new CircleGeometry(0.35, 16), new MeshStandardMaterial({ color: 0x3d2418, roughness: 1 }));
  dug.rotation.x = -Math.PI / 2;
  dug.scale.set(1.4, 0.7, 1);
  trench.add(dug);
  const clumps: Mesh[] = [];
  const iceMat = new MeshStandardMaterial({ color: 0xf4f8ff, roughness: 0.35, emissive: 0x223344 });
  for (let i = 0; i < 4; i++) {
    const c = part(trench, new SphereGeometry(0.05, 10, 8), iceMat, -0.2 + i * 0.13, 0.02, (i % 2) * 0.08 - 0.04);
    c.scale.y = 0.6;
    clumps.push(c);
  }
  trench.visible = false;

  const setWings = (open: number): void => {
    lander.wings.forEach((w, i) => (w.rotation.x = (i === 0 ? 1 : -1) * (1 - open) * 1.5));
    for (const w of lander.wings) w.scale.setScalar(0.25 + 0.75 * open);
  };
  const reset = (): void => {
    gsap.killTweensOf([lander.parts.root.position, lander.arm.rotation, lander.forearm.rotation]);
    lander.chute.visible = false;
    for (const f of lander.flames) f.visible = false;
    lander.arm.rotation.z = 0.9;
    lander.forearm.rotation.z = -2.3;
  };

  return {
    machine: lander.parts,
    objects: { trench, tega: lander.parts.body.getObjectByName('tega')!, meca: lander.parts.body.getObjectByName('meca')! },
    calls: {
      /** Before landing: high above the plain, wings folded. */
      arrive(c) {
        reset();
        setWings(0);
        trench.visible = false;
        c.machine.lift = DROP_HEIGHT;
      },
      /** Parachute, then thrusters, then a soft touchdown. */
      async descend(c, scope) {
        lander.chute.visible = true;
        c.audio.play('chute');
        await play(scope, c.machine, { lift: 3, duration: 3, ease: 'sine.out' });
        lander.chute.visible = false;
        c.audio.play('ignition');
        c.audio.rocket(0.5);
        scope.add(() => c.audio.rocket(0));
        for (const f of lander.flames) f.visible = true;
        await play(scope, c.machine, { lift: 0, duration: 2.6, ease: 'power1.inOut' });
        for (const f of lander.flames) f.visible = false;
        c.audio.rocket(0);
        c.audio.play('thud');
        c.fx.burst('dustBurst', c.resolve('machine'));
      },
      /** The solar wings unfold, once the dust has settled. */
      async unfurl(c, scope) {
        c.audio.play('servo');
        const state = { open: 0 };
        await play(scope, state, { open: 1, duration: 3, ease: 'power2.inOut', onUpdate: () => setWings(state.open) });
      },
      /** On the ground, wings still folded (waiting for the dust to settle). */
      landed(c) {
        reset();
        setWings(0);
        c.machine.lift = 0;
      },
      /** Every page after the panels open. */
      ready(c) {
        reset();
        setWings(1);
        c.machine.lift = 0;
      },
      /** The arm reaches out and scoops: the trench opens and bright clumps appear. */
      async dig(c, scope) {
        c.audio.play('servo');
        await play(scope, lander.arm.rotation, { z: -0.25, duration: 1.4, ease: 'sine.inOut' });
        await play(scope, lander.forearm.rotation, { z: -0.9, duration: 1, ease: 'sine.inOut' });
        c.fx.burst('dustPuff', new Vector3(TRENCH.x, ground(TRENCH.x, TRENCH.z), TRENCH.z));
        trench.visible = true;
        for (const cl of clumps) cl.scale.setScalar(1).setY(0.6);
        c.audio.play('servo');
        await play(scope, lander.arm.rotation, { z: 0.9, duration: 1.2, ease: 'sine.inOut' });
        await play(scope, lander.forearm.rotation, { z: -2.3, duration: 0.8, ease: 'sine.inOut' });
      },
      /** Four sols pass; the ice clumps vanish into the thin air. */
      async vanish(c, scope) {
        trench.visible = true;
        for (const cl of clumps) cl.scale.setScalar(1).setY(0.6);
        const sky = c.sky.state;
        const days = { t: 0 };
        await play(scope, days, {
          t: 4,
          duration: 6,
          ease: 'none',
          onUpdate: () => {
            sky.day = 0.55 + 0.45 * Math.cos(days.t * Math.PI * 2);
            const left = Math.max(0, 1 - days.t / 4);
            for (const cl of clumps) cl.scale.set(left, left * 0.6, left);
          },
        });
        sky.day = 1;
        c.audio.play('chime');
      },
    },
  };
}
