/**
 * Ingenuity in Jezero Crater: NASA's Ingenuity model as the machine, and NASA's Perseverance model
 * (the rover that carried it). The rotor half of the helicopter spins while it flies.
 * Calls: underRover, dropOff, ready, spin, rest, roverAway.
 */
import { Group, Mesh, SphereGeometry } from 'three';
import gsap from 'gsap';
import { buildPlaceholder, part, partsFromModel } from '../../engine/models';
import type { SceneBuild, SceneHandles } from '../../engine/types';
import { createRockMaterial, rockGeometry } from '../../engine/worlds/mars';
import { nasaModel, splitAbove } from '../../journey/nasaModels';

/** NASA: rotors about 1.2 m tip to tip (the model's widest side). */
const HELI_SIZE = 1.2;
const ROVER_SIZE = 3;
export const ROVER_AT = { x: 0, z: 0 };
/** Where Perseverance drives to after setting Ingenuity down (it then watches from a distance). */
export const ROVER_AWAY = { x: -9, z: -5 };
/** Where the helicopter takes off. */
export const HELIPAD = { x: 0, z: 0, heading: 0.6 } as const;

export default async function buildScene({ scene, world, materials, anisotropy }: SceneBuild): Promise<SceneHandles> {
  const ground = (x: number, z: number): number => world.heightAt(x, z);

  const rover = new Group();
  rover.position.set(ROVER_AT.x, ground(ROVER_AT.x, ROVER_AT.z), ROVER_AT.z);
  scene.add(rover);
  const roverModel = await nasaModel('perseverance', { size: ROVER_SIZE });
  if (roverModel) rover.add(roverModel);
  else part(rover, new SphereGeometry(0.8, 16, 12), materials.white, 0, 0.8, 0);

  // look-alike rocks for the spot-the-rover game, around the rover's far position
  const rocks: Mesh[] = [];
  const rockMat = createRockMaterial(anisotropy, 0x8a6a58);
  [
    [-4, -9],
    [-13, -2],
    [-6, 1],
  ].forEach(([x, z], i) => {
    const r = part(scene, rockGeometry(40 + i, 1), rockMat, x, ground(x, z) + 0.35, z);
    r.scale.set(1.3, 0.75, 1.1);
    r.name = `rock${i}`;
    rocks.push(r);
  });

  const heli = await nasaModel('ingenuity', { size: HELI_SIZE });
  const machine = heli ? partsFromModel(heli, 1, 0.9) : buildPlaceholder(materials);
  // the top of the model (rotor blades, mast and solar panel) turns as one when flying
  const rotor = heli ? splitAbove(heli, 0.55) : null;
  let spinRate = 0;

  return {
    machine,
    objects: { perseverance: rover, rock0: rocks[0], rock1: rocks[1], rock2: rocks[2] },
    calls: {
      /** Riding under the rover: the helicopter is hidden beneath its belly. */
      underRover(c) {
        gsap.killTweensOf(rover.position);
        rover.position.set(ROVER_AT.x, ground(ROVER_AT.x, ROVER_AT.z), ROVER_AT.z);
        c.machine.root.visible = false;
        spinRate = 0;
      },
      /** The rover drives away and leaves the helicopter standing on Mars. */
      async dropOff(c, scope) {
        c.machine.root.visible = true;
        c.audio.play('servo');
        c.audio.drive(1);
        scope.add(() => c.audio.drive(0));
        await scope.wait(
          gsap.to(rover.position, { x: ROVER_AWAY.x, z: ROVER_AWAY.z, y: ground(ROVER_AWAY.x, ROVER_AWAY.z), duration: 5, ease: 'sine.inOut' }),
        );
        c.audio.drive(0);
      },
      /** Every page after the drop-off: the rover parked away, the helicopter on its pad. */
      ready(c) {
        gsap.killTweensOf(rover.position);
        rover.position.set(ROVER_AWAY.x, ground(ROVER_AWAY.x, ROVER_AWAY.z), ROVER_AWAY.z);
        c.machine.root.visible = true;
        spinRate = 0;
      },
      spin(c) {
        spinRate = 40;
        c.audio.rotor(0.8);
      },
      rest(c) {
        spinRate = 0;
        c.audio.rotor(0);
      },
    },
    onReady(c) {
      c.machine.leavesTracksAt = () => false;
    },
    update(dt) {
      if (!rotor) return;
      // blades spin up while the machine is lifted (the flight game) or after a spin call
      const lifted = (machine.root.position.y - ground(machine.root.position.x, machine.root.position.z)) > 0.05;
      const target = lifted ? 40 : spinRate;
      rotor.rotation.y += dt * target;
    },
  };
}
