import type { Group, Object3D } from 'three';
import type { Quality } from '../progress';

export type WorldKind = 'mars' | 'moon' | 'space';

export interface World {
  kind: WorldKind;
  group: Group;
  /** Mesh to raycast taps against (null in open space). */
  ground: Object3D | null;
  heightAt(x: number, z: number): number;
  update(dt: number, time: number): void;
}

/** Real elevation samples (metres, relative to the landing point) on a square grid centred on the origin. */
export interface HeightGrid {
  /** Samples per side. */
  n: number;
  /** Width of the square in metres. */
  size: number;
  /** Row-major, first row = north edge (−z). */
  data: Float32Array;
}

export interface WorldOptions {
  quality: Quality;
  anisotropy: number;
  /** Keep big rocks out of this rectangle (the machine's working area). */
  clear?: { x0: number; x1: number; z0: number; z1: number };
  /** Mars only: real HiRISE terrain instead of the procedural plain. */
  site?: HeightGrid;
}

/** Bilinear sample of a height grid; positions outside the grid use the nearest edge. */
export function sampleGrid(grid: HeightGrid, x: number, z: number): number {
  const max = grid.n - 1;
  const u = Math.max(0, Math.min(max, (x / grid.size + 0.5) * max));
  const v = Math.max(0, Math.min(max, (z / grid.size + 0.5) * max));
  const x0 = Math.floor(u);
  const z0 = Math.floor(v);
  const x1 = Math.min(max, x0 + 1);
  const z1 = Math.min(max, z0 + 1);
  const fx = u - x0;
  const fz = v - z0;
  const d = grid.data;
  const top = d[z0 * grid.n + x0] * (1 - fx) + d[z0 * grid.n + x1] * fx;
  const bottom = d[z1 * grid.n + x0] * (1 - fx) + d[z1 * grid.n + x1] * fx;
  return top * (1 - fz) + bottom * fz;
}
