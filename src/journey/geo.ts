import { Vector3 } from 'three';

const DEG = Math.PI / 180;

/**
 * A point on a globe from latitude and east longitude (degrees). Matches three.js sphere UVs with
 * an equirectangular map centred on 0° longitude, which is how NASA's Mars and Moon maps are laid out.
 */
export function onGlobe(latDeg: number, lonEastDeg: number, radius: number, out = new Vector3()): Vector3 {
  const lat = latDeg * DEG;
  const lon = lonEastDeg * DEG;
  return out.set(radius * Math.cos(lat) * Math.cos(lon), radius * Math.sin(lat), -radius * Math.cos(lat) * Math.sin(lon));
}

/** "22.48° N, 47.94° W" from latitude and east longitude. */
export function formatSite(lat: number, lonEast: number): string {
  const lon = ((((lonEast + 180) % 360) + 360) % 360) - 180;
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}° ${ns}, ${Math.abs(lon).toFixed(2)}° ${ew}`;
}
