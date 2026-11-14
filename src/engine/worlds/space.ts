/** Open space: no ground. The star field and the Sun come from sky.ts; this adds drifting sparkles for depth. */
import { BufferGeometry, Float32BufferAttribute, Group, Points, PointsMaterial } from 'three';
import { hash } from '../noise';
import type { World, WorldOptions } from './world';

export function createSpace(opts: WorldOptions): World {
  const group = new Group();
  const count = opts.quality === 'high' ? 500 : 200;
  const positions: number[] = [];
  for (let i = 0; i < count; i++) {
    positions.push(hash(i, 301) * 60 - 30, hash(i, 303) * 40 - 20, hash(i, 305) * 60 - 30);
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
  const sparkles = new Points(
    geo,
    new PointsMaterial({ color: 0xbfd4ff, size: 0.05, transparent: true, opacity: 0.6, depthWrite: false }),
  );
  group.add(sparkles);

  return {
    kind: 'space',
    group,
    ground: null,
    heightAt: () => 0,
    update(dt) {
      sparkles.rotation.y += dt * 0.004;
    },
  };
}
