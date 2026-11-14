/** Earth: a flat coastal launch site (sand, scrub, a concrete pad) with the ocean on the horizon. */
import { Color, Float32BufferAttribute, Group, Mesh, MeshStandardMaterial, PlaneGeometry } from 'three';
import { fbm, smooth } from '../noise';
import { bumpDots, canvasTexture, speckle } from '../textures';
import type { World, WorldOptions } from './world';

const SIZE = 900;
const PAD_RADIUS = 14;
const SHORE_Z = -160;

export function createEarth(opts: WorldOptions): World {
  const group = new Group();
  const heightAt = (x: number, z: number): number => {
    const r = Math.hypot(x, z);
    return (fbm(x * 0.02 + 3, z * 0.02 + 8) - 0.5) * 2.4 * smooth(PAD_RADIUS, 60, r);
  };

  const segments = opts.quality === 'high' ? 180 : 110;
  const geo = new PlaneGeometry(SIZE, SIZE, segments, segments);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors: number[] = [];
  const sand = new Color(0xb9a77e);
  const scrub = new Color(0x55663a);
  const concrete = new Color(0x9a9890);
  const tint = new Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, heightAt(x, z));
    const r = Math.hypot(x, z);
    tint.copy(sand).lerp(scrub, fbm(x * 0.03, z * 0.03) * 1.3 - 0.1);
    if (r < PAD_RADIUS) tint.copy(concrete);
    colors.push(tint.r, tint.g, tint.b);
  }
  geo.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const map = canvasTexture(512, speckle('#a39a86', [50, 50, 40], 13), true, opts.anisotropy);
  const bumpMap = canvasTexture(512, bumpDots(5000, 3, 17), false, opts.anisotropy);
  map.repeat.set(180, 180);
  bumpMap.repeat.set(180, 180);
  const ground = new Mesh(geo, new MeshStandardMaterial({ map, bumpMap, bumpScale: 0.02, vertexColors: true, roughness: 1 }));
  ground.receiveShadow = true;
  group.add(ground);

  // the Atlantic beyond the launch site
  const ocean = new Mesh(
    new PlaneGeometry(SIZE * 2, SIZE),
    new MeshStandardMaterial({ color: 0x1d4466, roughness: 0.25, metalness: 0.2 }),
  );
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(0, 0.6, SHORE_Z - SIZE / 2);
  group.add(ocean);

  return { kind: 'earth', group, ground, heightAt, update: () => undefined };
}
