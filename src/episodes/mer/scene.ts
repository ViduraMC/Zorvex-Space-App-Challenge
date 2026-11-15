/**
 * Spirit and Opportunity: NASA's Mars Exploration Rover model is the machine (the twins were
 * identical, so the same model plays both). Its twin stands beside it on the first page.
 * Objects: twin, comanche (rock), homeplate (bright soil), b0..b4 (blueberries), p0..p3 (pebbles),
 * cp0..cp2 (drive checkpoints). Calls: twins, solo.
 */
import { CircleGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry } from 'three';
import type { Object3D } from 'three';
import { buildPlaceholder, part, partsFromModel } from '../../engine/models';
import { hash } from '../../engine/noise';
import type { SceneBuild, SceneHandles } from '../../engine/types';
import { createRockMaterial, rockGeometry } from '../../engine/worlds/mars';
import { nasaModel } from '../../journey/nasaModels';

const ROVER_SIZE = 1.6;
export const START = { x: 0, z: 0, heading: 0.3 } as const;
/** Where the rover parks to study the blueberries. */
export const BERRY_FIELD = { x: 4, z: 3 };
export const CHECKPOINTS: [number, number, number][] = [
  [8, 0, -2],
  [14, 0, 5],
  [7, 0, 11],
];

export default async function buildScene({ scene, world, materials, anisotropy }: SceneBuild): Promise<SceneHandles> {
  const ground = (x: number, z: number): number => world.heightAt(x, z);
  const objects: Record<string, Object3D> = {};

  const model = await nasaModel('mer-opportunity', { size: ROVER_SIZE });
  const machine = model ? partsFromModel(model, 1, 1.5) : buildPlaceholder(materials);
  machine.trackHalfWidth = 0.55;

  const twin = new Group();
  const twinModel = await nasaModel('mer-opportunity', { size: ROVER_SIZE });
  if (twinModel) twin.add(twinModel);
  twin.position.set(-2.6, ground(-2.6, 1.4), 1.4);
  twin.rotation.y = 0.9;
  scene.add(twin);
  objects.twin = twin;

  // Spirit's two famous finds: the Comanche outcrop and the bright silica soil at Home Plate
  const rockMat = createRockMaterial(anisotropy, 0x9a7a62);
  const comanche = part(scene, rockGeometry(71, 1), rockMat, -5, ground(-5, -4) + 0.4, -4);
  comanche.scale.set(1.4, 0.8, 1.1);
  objects.comanche = comanche;
  const silica = new Mesh(new CircleGeometry(0.75, 9), new MeshStandardMaterial({ color: 0xcdbfa8, roughness: 1 }));
  silica.rotation.x = -Math.PI / 2;
  silica.position.set(3, ground(3, -5) + 0.02, -5);
  scene.add(silica);
  objects.homeplate = silica;

  // Opportunity's blueberries: small grey spheres of hematite, and ordinary pebbles to confuse
  const berryMat = new MeshStandardMaterial({ color: 0x55606e, roughness: 0.5, metalness: 0.2 });
  for (let i = 0; i < 5; i++) {
    const a = hash(i, 11) * Math.PI * 2;
    const r = 0.6 + hash(i, 12) * 1.4;
    const x = BERRY_FIELD.x + Math.cos(a) * r;
    const z = BERRY_FIELD.z + Math.sin(a) * r;
    objects[`b${i}`] = part(scene, new SphereGeometry(0.06, 14, 10), berryMat, x, ground(x, z) + 0.05, z);
  }
  const pebbleMat = createRockMaterial(anisotropy, 0xa07658);
  for (let i = 0; i < 4; i++) {
    const a = hash(i, 21) * Math.PI * 2;
    const r = 0.8 + hash(i, 22) * 1.4;
    const x = BERRY_FIELD.x + Math.cos(a) * r;
    const z = BERRY_FIELD.z + Math.sin(a) * r;
    const p = part(scene, rockGeometry(80 + i, 0), pebbleMat, x, ground(x, z) + 0.05, z);
    p.scale.setScalar(0.09);
    objects[`p${i}`] = p;
  }
  CHECKPOINTS.forEach(([x, , z], i) => {
    const marker = new Group();
    marker.position.set(x, ground(x, z), z);
    scene.add(marker);
    objects[`cp${i}`] = marker;
  });

  return {
    machine,
    objects,
    calls: {
      twins() {
        twin.visible = true;
      },
      solo() {
        twin.visible = false;
      },
    },
  };
}
