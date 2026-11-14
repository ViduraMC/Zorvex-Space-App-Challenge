/**
 * Moon surface: grey regolith, craters, a hard single Sun (see sky.ts) and Earth in the black sky.
 * Procedural for now. Upgrade path: NASA's CGI Moon Kit (LRO colour + LOLA heights),
 * https://svs.gsfc.nasa.gov/4720, credit "NASA's Scientific Visualization Studio".
 */
import {
  Color,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Quaternion,
  SphereGeometry,
  Vector3,
} from 'three';
import { fbm, hash, smooth } from '../noise';
import { bumpDots, canvasTexture, speckle } from '../textures';
import { createRockMaterial, rockGeometry } from './mars';
import type { World, WorldOptions } from './world';

const PLAIN_SIZE = 520;
const CRATER_COUNT = 26;

export function createMoon(opts: WorldOptions): World {
  const group = new Group();

  const craters = Array.from({ length: CRATER_COUNT }, (_, i) => {
    const angle = hash(i, 201) * Math.PI * 2;
    const dist = 14 + hash(i, 203) * 190;
    return { x: Math.cos(angle) * dist, z: Math.sin(angle) * dist, r: 3 + hash(i, 205) ** 2 * 26 };
  });

  const heightAt = (x: number, z: number): number => {
    const r = Math.sqrt(x * x + z * z);
    let h = (fbm(x * 0.02 + 40, z * 0.02 + 40) - 0.5) * 9 * smooth(10, 80, r);
    h += (fbm(x * 0.3, z * 0.3) - 0.5) * 0.4 * smooth(5, 14, r);
    for (const c of craters) {
      const d = Math.sqrt((x - c.x) ** 2 + (z - c.z) ** 2) / c.r;
      // bowl inside the rim, raised lip at d = 1, fading out by d = 1.6
      if (d < 1.6) h += c.r * 0.16 * (d < 1 ? d * d - 1 : 0) + c.r * 0.05 * Math.exp(-((d - 1) ** 2) / 0.03);
    }
    return h;
  };

  const segments = opts.quality === 'high' ? 240 : 160;
  const geo = new PlaneGeometry(PLAIN_SIZE, PLAIN_SIZE, segments, segments);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors: number[] = [];
  const dark = new Color(0x5c5a57);
  const light = new Color(0x9c9995);
  const tint = new Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, heightAt(x, z));
    tint.copy(dark).lerp(light, fbm(x * 0.05 + 1, z * 0.05 + 5));
    colors.push(tint.r, tint.g, tint.b);
  }
  geo.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const map = canvasTexture(512, speckle('#8d8a86', [40, 40, 40], 7), true, opts.anisotropy);
  const bumpMap = canvasTexture(512, bumpDots(7000, 3, 71), false, opts.anisotropy);
  map.repeat.set(240, 240);
  bumpMap.repeat.set(240, 240);
  const ground = new Mesh(
    geo,
    new MeshStandardMaterial({ map, bumpMap, bumpScale: 0.02, vertexColors: true, roughness: 1, metalness: 0 }),
  );
  ground.receiveShadow = true;
  group.add(ground);

  const rockCount = opts.quality === 'high' ? 500 : 250;
  const rocks = new InstancedMesh(rockGeometry(5, 1), createRockMaterial(opts.anisotropy, 0x8f8c88), rockCount);
  const m4 = new Matrix4();
  const quat = new Quaternion();
  for (let k = 0; k < rockCount; k++) {
    const angle = hash(k, 211) * Math.PI * 2;
    const dist = 5 + hash(k, 213) ** 1.5 * 90;
    const s = 0.03 + hash(k, 215) ** 3 * 0.4;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;
    quat.setFromAxisAngle(new Vector3(0, 1, 0), hash(k, 217) * 6.28);
    rocks.setMatrixAt(k, m4.compose(new Vector3(x, heightAt(x, z) + s * 0.2, z), quat, new Vector3(s, s * 0.8, s)));
  }
  rocks.castShadow = true;
  rocks.receiveShadow = true;
  group.add(rocks);

  // Earth hangs in the lunar sky, about four times as wide as the Moon looks from home.
  const earthMap = canvasTexture(
    256,
    (g, n) => {
      g.fillStyle = '#1d4f9c';
      g.fillRect(0, 0, n, n);
      for (let k = 0; k < 60; k++) {
        g.fillStyle = hash(k, 221) > 0.45 ? 'rgba(255,255,255,.55)' : 'rgba(60,130,70,.7)';
        g.beginPath();
        g.ellipse(hash(k, 223) * n, hash(k, 225) * n, 8 + hash(k, 227) * 30, 4 + hash(k, 229) * 10, hash(k, 231) * 3, 0, Math.PI * 2);
        g.fill();
      }
    },
    true,
  );
  const earth = new Mesh(new SphereGeometry(42, 32, 20), new MeshBasicMaterial({ map: earthMap, fog: false }));
  earth.position.set(-420, 520, -900);
  group.add(earth);

  return {
    kind: 'moon',
    group,
    ground,
    heightAt,
    update(dt) {
      earth.rotation.y += dt * 0.01;
    },
  };
}
