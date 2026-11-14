/**
 * Sojourner's scene: the Pathfinder lander (petals, deflated airbags, camera mast, ramp), the
 * airbag ball that bounces in, the rover itself, the three named rocks and the pebbles.
 * Everything is built in code: NASA publishes no official Sojourner 3D model.
 * Layout: the lander sits at the origin, the ramp points along +x, 1 unit = 1 metre.
 */
import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  PointLight,
  SphereGeometry,
  Vector3,
} from 'three';
import type { Object3D } from 'three';
import gsap from 'gsap';
import { part, tube, type MachineMaterials, type MachineParts } from '../../engine/models';
import { hash, lerp } from '../../engine/noise';
import type { EpisodeContext, SceneBuild, SceneHandles } from '../../engine/types';
import { createRockMaterial, rockGeometry } from '../../engine/worlds/mars';

const DECK_HEIGHT = 0.155;
const RAMP_START = 1.86;
const RAMP_END = 2.8;
const RAMP_HALF_WIDTH = 0.7;
const WHEEL_RADIUS = 0.065;
/** The real airbag ball was 5.2 m across (NSSDCA). */
const AIRBAG_RADIUS = 2.6;
export const ROVER_START = { x: 1.05, z: 0, heading: 0 };
export const RAMP_FOOT = { x: 3.35, z: 0 };

/** The three rocks the team named after cartoon characters. `s` = half-sizes in metres. */
const NAMED_ROCKS = [
  { id: 'barnacleBill', x: 4.1, z: 1.15, s: [0.2, 0.17, 0.19], color: 0x8c6a55 },
  { id: 'yogi', x: 5.5, z: -1.35, s: [0.62, 0.56, 0.58], color: 0x7c5c4a },
  { id: 'scoobyDoo', x: 3.5, z: 2.75, s: [0.34, 0.13, 0.26], color: 0xc9b8a6 },
] as const;

/** Smooth round pebbles (the water clue) hidden among sharp little rocks. */
const PEBBLES = [
  [4.45, 0.35],
  [4.98, -0.08],
  [4.72, 0.78],
] as const;
const SHARP_ROCKS = [
  [4.62, 0.08],
  [5.08, 0.5],
  [4.3, 0.72],
  [4.88, 1.0],
] as const;

function buildLander(mats: MachineMaterials): { lander: Group; petals: Group[]; lamp: PointLight } {
  const lander = new Group();
  part(lander, new CylinderGeometry(0.42, 0.62, 0.34, 3), mats.white, 0, 0.3, 0).rotation.y = Math.PI / 6;
  part(lander, new BoxGeometry(0.34, 0.14, 0.3), mats.gold, -0.05, 0.54, 0.05);
  const petals: Group[] = [];
  for (let i = 0; i < 3; i++) {
    const hinge = new Group();
    const angle = (i * Math.PI * 2) / 3;
    hinge.rotation.y = -angle;
    hinge.position.set(Math.cos(angle) * 0.45, 0.13, Math.sin(angle) * 0.45);
    part(hinge, new CylinderGeometry(0.98, 0.98, 0.035, 3), mats.alu, 0.62, 0, 0).rotation.y = Math.PI;
    part(hinge, new CylinderGeometry(0.86, 0.86, 0.012, 3), mats.solar, 0.62, 0.024, 0).rotation.y = Math.PI;
    lander.add(hinge);
    petals.push(hinge);
  }
  // deflated airbags lie around the base
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2;
    const dist = 0.95 + hash(i, 71) * 0.95;
    const bag = part(lander, new SphereGeometry(0.34 + hash(i, 73) * 0.2, 18, 12), mats.fabric, Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
    bag.scale.y = 0.17 + hash(i, 75) * 0.07;
    bag.castShadow = false;
  }
  // camera mast with two "eyes", antenna dish
  const lens = mats.lens.clone();
  tube(lander, new Vector3(0.1, 0.45, -0.1), new Vector3(0.1, 1.55, -0.1), 0.022, mats.alu);
  part(lander, new BoxGeometry(0.2, 0.12, 0.12), mats.white, 0.1, 1.6, -0.1);
  for (const z of [-0.065, -0.135]) part(lander, new CylinderGeometry(0.03, 0.03, 0.03, 12), lens, 0.2, 1.6, z).rotation.z = Math.PI / 2;
  part(lander, new CylinderGeometry(0.16, 0.16, 0.015, 20), mats.white, -0.25, 0.86, 0.2).rotation.set(0.5, 0, 0.5);
  tube(lander, new Vector3(-0.2, 0.45, 0.15), new Vector3(-0.25, 0.86, 0.2), 0.012, mats.alu);
  tube(lander, new Vector3(-0.1, 0.45, -0.25), new Vector3(-0.1, 1.05, -0.25), 0.008, mats.dark);
  // the ramp Sojourner rolls down
  for (const z of [0.16, -0.16]) tube(lander, new Vector3(RAMP_START, DECK_HEIGHT, z), new Vector3(RAMP_END, 0.01, z), 0.02, mats.alu);
  for (let i = 0; i < 9; i++) {
    const x = 1.9 + i * 0.105;
    part(lander, new BoxGeometry(0.02, 0.006, 0.36), mats.alu, x, DECK_HEIGHT - (x - RAMP_START) * 0.154, 0);
  }
  const lamp = new PointLight(0xffc67a, 0, 6, 2);
  lamp.position.set(0.25, 1.6, -0.1);
  lander.add(lamp);
  return { lander, petals, lamp };
}

/** Sojourner: 63 cm long, six cleated wheels on a rocker-bogie, solar deck on top (NSSDCA). */
function buildRover(mats: MachineMaterials): MachineParts {
  const root = new Group();
  const body = new Group();
  root.add(body);
  const eyes = mats.lens.clone();
  part(body, new BoxGeometry(0.44, 0.13, 0.3), mats.gold, 0, 0.2, 0);
  part(body, new BoxGeometry(0.46, 0.012, 0.32), mats.alu, 0, 0.268, 0);
  part(body, new BoxGeometry(0.62, 0.012, 0.46), mats.alu, -0.02, 0.292, 0);
  part(body, new BoxGeometry(0.58, 0.008, 0.42), mats.solar, -0.02, 0.301, 0);
  for (const side of [-1, 1]) {
    part(body, new CylinderGeometry(0.02, 0.02, 0.05, 14), mats.dark, 0.235, 0.215, side * 0.07).rotation.z = Math.PI / 2;
    part(body, new CylinderGeometry(0.014, 0.014, 0.006, 14), eyes, 0.262, 0.215, side * 0.07).rotation.z = Math.PI / 2;
  }
  part(body, new BoxGeometry(0.03, 0.03, 0.06), mats.dark, 0.235, 0.165, 0);
  // the APXS sensor on its arm at the back, and the whip antenna
  tube(body, new Vector3(-0.22, 0.2, 0), new Vector3(-0.3, 0.16, 0), 0.012, mats.alu);
  part(body, new CylinderGeometry(0.028, 0.028, 0.05, 14), mats.white, -0.32, 0.15, 0).rotation.z = Math.PI / 2;
  tube(body, new Vector3(-0.24, 0.3, 0.19), new Vector3(-0.24, 0.78, 0.19), 0.004, mats.dark);
  part(body, new SphereGeometry(0.009, 8, 8), mats.alu, -0.24, 0.78, 0.19);

  const wheels: Object3D[] = [];
  for (const wx of [-0.23, 0, 0.23]) {
    for (const wz of [-0.215, 0.215]) {
      const spin = new Group();
      spin.position.set(wx, WHEEL_RADIUS, wz);
      body.add(spin);
      wheels.push(spin);
      part(spin, new CylinderGeometry(WHEEL_RADIUS - 0.006, WHEEL_RADIUS - 0.006, 0.075, 22), mats.alu).rotation.x = Math.PI / 2;
      part(spin, new CylinderGeometry(0.028, 0.028, 0.08, 12), mats.dark).rotation.x = Math.PI / 2;
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * Math.PI * 2;
        const cleat = part(spin, new BoxGeometry(0.013, 0.01, 0.075), mats.dark, Math.cos(a) * (WHEEL_RADIUS - 0.002), Math.sin(a) * (WHEEL_RADIUS - 0.002), 0);
        cleat.rotation.z = a + Math.PI / 2;
      }
    }
  }
  for (const side of [-1, 1]) {
    const z = side * 0.168;
    const pivot = new Vector3(-0.11, 0.14, z);
    tube(body, new Vector3(0.23, WHEEL_RADIUS, z), new Vector3(0.06, 0.2, z), 0.011, mats.alu);
    tube(body, new Vector3(0.06, 0.2, z), pivot, 0.011, mats.alu);
    tube(body, new Vector3(-0.23, WHEEL_RADIUS, z), pivot, 0.011, mats.alu);
    tube(body, new Vector3(0, WHEEL_RADIUS, z), pivot, 0.011, mats.alu);
    part(body, new SphereGeometry(0.018, 10, 10), mats.dark, 0.06, 0.2, z);
  }
  const lamp = new PointLight(0xffd29a, 0, 3.2, 2);
  lamp.position.set(0.34, 0.24, 0);
  body.add(lamp);
  return { root, body, bubbleHeight: 0.42, wheels, wheelRadius: WHEEL_RADIUS, trackHalfWidth: 0.215, eyes, lamp };
}

function buildAirbagBall(mats: MachineMaterials): Group {
  const ball = new Group();
  part(ball, new SphereGeometry(AIRBAG_RADIUS * 0.72, 24, 16), mats.fabric);
  const lobes = new IcosahedronGeometry(AIRBAG_RADIUS * 0.62, 0).attributes.position;
  for (let i = 0; i < lobes.count; i++) {
    part(ball, new SphereGeometry(AIRBAG_RADIUS * 0.42, 16, 12), mats.fabric, lobes.getX(i), lobes.getY(i), lobes.getZ(i));
  }
  ball.visible = false;
  return ball;
}

export default function buildScene({ scene, world, materials, anisotropy }: SceneBuild): SceneHandles {
  const { lander, petals, lamp } = buildLander(materials);
  const ball = buildAirbagBall(materials);
  scene.add(lander, ball);
  const objects: Record<string, Object3D> = { lander };

  NAMED_ROCKS.forEach((r, k) => {
    const rock = new Mesh(rockGeometry(200 + k * 13, 2), createRockMaterial(anisotropy, r.color));
    rock.scale.set(r.s[0], r.s[1], r.s[2]);
    rock.position.set(r.x, world.heightAt(r.x, r.z) + r.s[1] * 0.45, r.z);
    rock.rotation.y = k * 1.7;
    rock.castShadow = rock.receiveShadow = true;
    scene.add(rock);
    objects[r.id] = rock;
  });

  const pebbleMat = new MeshStandardMaterial({ color: 0xd8c0a0, roughness: 0.55, metalness: 0 });
  PEBBLES.forEach(([x, z], k) => {
    const r = 0.05 + hash(k, 401) * 0.02;
    const pebble = part(scene, new SphereGeometry(r, 20, 14), pebbleMat, x, world.heightAt(x, z) + r * 0.55, z);
    pebble.scale.set(1.25, 0.72, 1);
    pebble.rotation.y = k * 2.1;
    objects[`pebble${k + 1}`] = pebble;
  });
  const sharpMat = createRockMaterial(anisotropy, 0x6a4a3c);
  SHARP_ROCKS.forEach(([x, z], k) => {
    const sharp = part(scene, new IcosahedronGeometry(0.08, 0), sharpMat, x, world.heightAt(x, z) + 0.04, z);
    sharp.scale.set(1.2, 0.9 + hash(k, 403) * 0.5, 0.8);
    sharp.rotation.set(hash(k, 405) * 3, hash(k, 407) * 3, hash(k, 409) * 3);
    objects[`sharp${k + 1}`] = sharp;
  });

  let ctx: EpisodeContext | null = null;
  /** 1 = the lander is awake and its lamp glows; it fades to 0 when contact is lost. */
  const landerState = { power: 1 };

  const showLanding = (landed: boolean): void => {
    ball.visible = false;
    lander.visible = landed;
    if (ctx) ctx.machine.root.visible = landed;
  };
  const setPetals = (open: boolean): void => {
    gsap.killTweensOf([petals[1].rotation, petals[2].rotation]);
    petals[1].rotation.z = petals[2].rotation.z = open ? 0 : 1.5;
  };

  return {
    machine: buildRover(materials),
    objects,
    onReady(context) {
      ctx = context;
      const { machine } = context;
      // the rover rides on the lander deck, then down the ramp, then on Mars itself
      machine.groundAt = (x, z) => {
        if (Math.abs(z) < RAMP_HALF_WIDTH && x < RAMP_START) return DECK_HEIGHT;
        if (Math.abs(z) < RAMP_HALF_WIDTH && x < RAMP_END) {
          return lerp(DECK_HEIGHT, world.heightAt(RAMP_END, z), (x - RAMP_START) / (RAMP_END - RAMP_START));
        }
        return world.heightAt(x, z);
      };
      machine.leavesTracksAt = (x) => x > RAMP_END + 0.05;
    },
    update() {
      if (!ctx) return;
      lamp.intensity = landerState.power * (0.3 + 1.8 * (1 - ctx.sky.state.day));
    },
    calls: {
      /** Page 1 start: nothing has landed yet. */
      arrive() {
        showLanding(false);
        setPetals(false);
        landerState.power = 1;
      },
      /** Any later page: lander down, petals open. Safe to call after a skip. */
      landed() {
        showLanding(true);
        setPetals(true);
      },
      /** The airbag ball falls from the sky and bounces to a stop. */
      async bounceIn(context, scope) {
        const { fx, audio, comic, t } = context;
        const hops = [
          { x: -26, z: -21, height: 12, seconds: 1.25 },
          { x: -15, z: -12, height: 7, seconds: 1.3 },
          { x: -8, z: -6.4, height: 4, seconds: 1.05 },
          { x: -3.4, z: -2.7, height: 2, seconds: 0.8 },
          { x: 0, z: 0, height: 0.8, seconds: 0.55 },
        ];
        // it flies in from the far background, straight towards the opening camera
        let from = { x: -40, z: -32 };
        ball.visible = true;
        for (const [i, hop] of hops.entries()) {
          const flight = { u: i === 0 ? 0.5 : 0 }; // the first hop starts at the top of its arc
          await scope.wait(
            gsap.to(flight, {
              u: 1,
              duration: hop.seconds * (i === 0 ? 0.8 : 1),
              ease: 'none',
              onUpdate: () => {
                const x = lerp(from.x, hop.x, flight.u);
                const z = lerp(from.z, hop.z, flight.u);
                const arc = hop.height * 4 * flight.u * (1 - flight.u);
                ball.position.set(x, world.heightAt(x, z) + AIRBAG_RADIUS * 0.9 + arc, z);
                ball.rotation.x += 0.05;
                ball.rotation.z += 0.03;
              },
            }),
          );
          from = hop;
          fx.burst('dustBurst', new Vector3(hop.x, world.heightAt(hop.x, hop.z), hop.z));
          audio.play(i < 3 ? 'boing' : 'thud');
          if (i < 3) comic.sfx(t('sfx.boing'));
        }
        showLanding(true);
      },
      async openPetals(_context, scope) {
        gsap.to(petals[1].rotation, { z: 0, duration: 1.8, ease: 'power2.inOut' });
        await scope.wait(gsap.to(petals[2].rotation, { z: 0, duration: 2.1, ease: 'power2.inOut' }));
      },
      async rollDown(context, scope) {
        await scope.wait(context.machine.driveTo(RAMP_FOOT.x, RAMP_FOOT.z, 6500));
      },
      landerAwake() {
        gsap.killTweensOf(landerState);
        landerState.power = 1;
      },
      landerQuiet() {
        gsap.to(landerState, { power: 0, duration: 6 });
      },
    },
  };
}
