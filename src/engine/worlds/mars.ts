/**
 * Mars surface: a rocky plain under a dusty sky. Procedural by default; pass `site` (a real HiRISE
 * height grid) to get the true shape of the land with procedural micro-detail and rocks on top.
 */
import {
  BufferGeometry,
  Color,
  Euler,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Quaternion,
  Vector3,
} from 'three';
import { clamp, fbm, hash, smooth, vnoise } from '../noise';
import { bumpDots, canvasTexture, speckle } from '../textures';
import { sampleGrid, type World, type WorldOptions } from './world';

const PLAIN_SIZE = 520;
const SOIL_DARK = 0x7a4c32;
const SOIL_LIGHT = 0xba8c62;

/** A lumpy rock; the same seed always gives the same rock. */
export function rockGeometry(seed: number, detail: number): BufferGeometry {
  const geo = new IcosahedronGeometry(1, detail);
  const p = geo.attributes.position;
  const normals: number[] = [];
  for (let k = 0; k < p.count; k++) {
    const x = p.getX(k);
    const y = p.getY(k);
    const z = p.getZ(k);
    const d = 0.66 + 0.66 * vnoise(x * 1.7 + seed + z * 0.9, y * 1.7 - z * 1.3 + seed * 0.37);
    const px = x * d;
    const py = y * d * 0.72;
    const pz = z * d;
    const len = Math.sqrt(px * px + py * py * 3.6 + pz * pz) || 1;
    p.setXYZ(k, px, py, pz);
    normals.push(px / len, (py * 1.9) / len, pz / len);
  }
  geo.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  return geo;
}

export function createRockMaterial(anisotropy: number, color = 0xffffff): MeshStandardMaterial {
  const map = canvasTexture(
    256,
    (g, n) => {
      g.fillStyle = '#c4bab0';
      g.fillRect(0, 0, n, n);
      for (let k = 0; k < 5000; k++) {
        const v = Math.floor(60 + hash(k, 41) * 150);
        g.fillStyle = `rgba(${v},${Math.floor(v * 0.9)},${Math.floor(v * 0.82)},.5)`;
        g.beginPath();
        g.arc(hash(k, 43) * n, hash(k, 45) * n, 0.5 + hash(k, 47) * 3.5, 0, Math.PI * 2);
        g.fill();
      }
    },
    true,
    anisotropy,
  );
  const bumpMap = canvasTexture(256, bumpDots(4000, 4, 51), false, anisotropy);
  return new MeshStandardMaterial({ color, map, bumpMap, bumpScale: 0.03, roughness: 0.96, metalness: 0 });
}

export function createMars(opts: WorldOptions): World {
  const group = new Group();
  const site = opts.site;

  // The landing spot (radius ~9 m) is kept nearly flat so the lander and its ramp sit true.
  const heightAt = (x: number, z: number): number => {
    const r = Math.sqrt(x * x + z * z);
    let h = (fbm(x * 0.22, z * 0.22) - 0.5) * 0.7 * smooth(6, 16, r);
    h += (fbm(x * 1.3, z * 1.3) - 0.5) * 0.035;
    if (site) return h + sampleGrid(site, x, z) * smooth(8, 60, r);
    h += (fbm(x * 0.03 + 10, z * 0.03 + 10) - 0.5) * 13 * smooth(9, 75, r);
    // two stand-in hills on the horizon where the real site has its Twin Peaks
    h += 17 * Math.exp(-((x - 70) ** 2 + (z + 95) ** 2) / (2 * 22 * 22));
    h += 13 * Math.exp(-((x - 118) ** 2 + (z + 78) ** 2) / (2 * 20 * 20));
    return h;
  };

  const size = site ? site.size : PLAIN_SIZE;
  const segments = opts.quality === 'high' ? 240 : 160;
  const geo = new PlaneGeometry(size, size, segments, segments);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors: number[] = [];
  const dark = new Color(SOIL_DARK);
  const light = new Color(SOIL_LIGHT);
  const tint = new Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, heightAt(x, z));
    tint.copy(dark).lerp(light, clamp(fbm(x * 0.045 + 3, z * 0.045 + 7) * 1.5 - 0.25, 0, 1));
    colors.push(tint.r, tint.g, tint.b);
  }
  geo.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const tiles = size / 2.2;
  const map = canvasTexture(512, speckle('#a8714a', [60, 24, 10], 1), true, opts.anisotropy);
  const bumpMap = canvasTexture(512, bumpDots(7000, 3, 31), false, opts.anisotropy);
  map.repeat.set(tiles, tiles);
  bumpMap.repeat.set(tiles, tiles);
  const ground = new Mesh(
    geo,
    new MeshStandardMaterial({ map, bumpMap, bumpScale: 0.014, vertexColors: true, roughness: 1, metalness: 0 }),
  );
  ground.receiveShadow = true;
  group.add(ground);

  const rockMat = createRockMaterial(opts.anisotropy);
  const m4 = new Matrix4();
  const quat = new Quaternion();
  const euler = new Euler();
  const at = new Vector3();
  const scale = new Vector3();
  const rockDark = new Color(0x4a362c);
  const rockLight = new Color(0x9a7458);
  const clear = opts.clear;

  const scatter = (count: number, rMin: number, rMax: number, sMin: number, sMax: number, seed: number, detail: number): void => {
    const mesh = new InstancedMesh(rockGeometry(seed, detail), rockMat, count);
    for (let k = 0; k < count; k++) {
      const angle = hash(k, seed) * Math.PI * 2;
      const radius = rMin + Math.pow(hash(k, seed + 1), 1.6) * (rMax - rMin);
      let x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const s = sMin + Math.pow(hash(k, seed + 2), 3) * (sMax - sMin);
      // boulders that would block the working area are pushed out past its far edge
      if (clear && sMax > 0.08 && x > clear.x0 && x < clear.x1 && z > clear.z0 && z < clear.z1) x += clear.x1 - clear.x0 + 1;
      euler.set(hash(k, seed + 3) * 6.28, hash(k, seed + 4) * 6.28, hash(k, seed + 5) * 6.28);
      quat.setFromEuler(euler);
      at.set(x, heightAt(x, z) + s * 0.22, z);
      scale.set(s * (0.8 + hash(k, seed + 6) * 0.6), s, s * (0.8 + hash(k, seed + 7) * 0.6));
      mesh.setMatrixAt(k, m4.compose(at, quat, scale));
      mesh.setColorAt(k, tint.copy(rockDark).lerp(rockLight, hash(k, seed + 8)));
    }
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  };
  const low = opts.quality === 'low';
  scatter(low ? 420 : 760, 4.5, 110, 0.05, 0.6, 11, 2);
  scatter(low ? 900 : 2200, 1.3, 18, 0.01, 0.045, 57, 1);

  // dust hanging in the thin air, drifting with the wind
  const dustCount = low ? 300 : 700;
  const dustPos: number[] = [];
  for (let i = 0; i < dustCount; i++) dustPos.push(hash(i, 91) * 40 - 14, hash(i, 93) * 5, hash(i, 95) * 40 - 20);
  const dustGeo = new BufferGeometry();
  dustGeo.setAttribute('position', new Float32BufferAttribute(dustPos, 3));
  const dust = new Points(
    dustGeo,
    new PointsMaterial({ color: 0xffd9b0, size: 0.035, transparent: true, opacity: 0.4, depthWrite: false }),
  );
  group.add(dust);

  return {
    kind: 'mars',
    group,
    ground,
    heightAt,
    update(dt) {
      const p = dustGeo.attributes.position;
      for (let k = 0; k < p.count; k++) {
        const nx = p.getX(k) + dt * 0.25;
        p.setX(k, nx > 26 ? -14 : nx);
      }
      p.needsUpdate = true;
    },
  };
}
