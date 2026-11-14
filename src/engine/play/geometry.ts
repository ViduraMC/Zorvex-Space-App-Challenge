/** Pure 2D maths for the mini-games (ground plane: x and z). No imports, so node can test it directly. */

/**
 * Where along the segment A→B (0 = A, 1 = B) a moving point first touches a circle.
 * Null when the segment misses the circle. A start inside the circle counts as a hit at 0.
 */
export function segmentCircleHit(
  ax: number,
  az: number,
  bx: number,
  bz: number,
  cx: number,
  cz: number,
  radius: number,
): number | null {
  const dx = bx - ax;
  const dz = bz - az;
  const fx = ax - cx;
  const fz = az - cz;
  const c = fx * fx + fz * fz - radius * radius;
  if (c <= 0) return 0;
  const a = dx * dx + dz * dz;
  if (a === 0) return null;
  const b = 2 * (fx * dx + fz * dz);
  const disc = b * b - 4 * a * c;
  if (disc < 0) return null;
  const t = (-b - Math.sqrt(disc)) / (2 * a);
  return t >= 0 && t <= 1 ? t : null;
}

export const distance2d = (ax: number, az: number, bx: number, bz: number): number => Math.hypot(bx - ax, bz - az);

/** One-way travel time of a radio signal or light, in seconds. */
export function lightSeconds(distanceKm: number): number {
  const LIGHT_SPEED_KM_S = 299_792.458;
  return distanceKm / LIGHT_SPEED_KM_S;
}
