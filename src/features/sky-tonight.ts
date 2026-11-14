/**
 * "Look up tonight": where Mars or the Moon is in the child's sky right now, and how long a
 * radio message would take to get there. Positions are computed on the device with
 * astronomy-engine (no network call). Default place: Kandy, our local event city.
 */
import { Body, Equator, GeoVector, Horizon, KM_PER_AU, Observer, SearchRiseSet } from 'astronomy-engine';
import { CONFIG } from '../config';
import { button, el } from '../dom';
import { t } from '../engine/i18n';
import { lightSeconds } from '../engine/play/geometry';

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;
/** A fist held at arm's length covers roughly ten degrees of sky. */
const DEGREES_PER_FIST = 10;
/** Sun this far under the horizon = dark enough to see planets. */
const DARK_SUN_ALTITUDE = -6;

export interface SkyReport {
  altitude: number;
  azimuth: number;
  direction: (typeof COMPASS)[number];
  isUp: boolean;
  isDark: boolean;
  /** Next rise, when the body is below the horizon. */
  rise: Date | null;
  distanceKm: number;
  signalSeconds: number;
}

/** Pure calculation, exported for tests. */
export function skyReport(body: 'Mars' | 'Moon', when: Date, lat: number, lon: number): SkyReport {
  const observer = new Observer(lat, lon, 0);
  const target = Body[body];
  const eq = Equator(target, when, observer, true, true);
  const hor = Horizon(when, observer, eq.ra, eq.dec, 'normal');
  const sunEq = Equator(Body.Sun, when, observer, true, true);
  const sun = Horizon(when, observer, sunEq.ra, sunEq.dec, 'normal');
  const isUp = hor.altitude > 0;
  const distanceKm = GeoVector(target, when, true).Length() * KM_PER_AU;
  return {
    altitude: hor.altitude,
    azimuth: hor.azimuth,
    direction: COMPASS[Math.round(hor.azimuth / 45) % 8],
    isUp,
    isDark: sun.altitude < DARK_SUN_ALTITUDE,
    rise: isUp ? null : (SearchRiseSet(target, observer, +1, when, 2)?.date ?? null),
    distanceKm,
    signalSeconds: lightSeconds(distanceKm),
  };
}

/** Build the card. Returns the element; the caller places it. */
export function skyTonightCard(body: 'Mars' | 'Moon'): HTMLElement {
  const card = el('section', 'card sky-card');
  const heading = el('h2', '', t('ui.sky.title'), card);
  const dial = el('div', 'sky-dial', undefined, card);
  const dot = el('div', 'sky-dot', undefined, dial);
  for (const dir of ['N', 'E', 'S', 'W'] as const) el('span', `sky-compass sky-${dir}`, t(`ui.dir.${dir}`), dial);
  const where = el('p', 'sky-where', undefined, card);
  const signal = el('p', 'sky-signal', undefined, card);
  const place = el('p', 'sky-place', undefined, card);

  const render = (lat: number, lon: number, placeName: string): void => {
    const r = skyReport(body, new Date(), lat, lon);
    const name = t(`ui.body.${body}`);
    heading.textContent = t('ui.sky.title');
    // dial: centre = straight overhead, rim = horizon, north at the top
    const reach = (90 - Math.max(0, r.altitude)) / 90;
    const angle = (r.azimuth * Math.PI) / 180;
    dot.style.left = `${50 + Math.sin(angle) * reach * 46}%`;
    dot.style.top = `${50 - Math.cos(angle) * reach * 46}%`;
    dot.classList.toggle('below', !r.isUp);
    if (r.isUp) {
      const fists = Math.max(1, Math.round(r.altitude / DEGREES_PER_FIST));
      where.textContent = t(r.isDark ? 'ui.sky.up' : 'ui.sky.upDay', { body: name, dir: t(`ui.dir.${r.direction}`), fists });
    } else {
      const time = r.rise ? r.rise.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '?';
      where.textContent = t('ui.sky.down', { body: name, time });
    }
    const far =
      body === 'Mars'
        ? t('ui.sky.signalMin', { km: Math.round(r.distanceKm / 1e6), min: Math.round(r.signalSeconds / 60) })
        : t('ui.sky.signalSec', { km: Math.round(r.distanceKm / 1000) * 1000, sec: r.signalSeconds.toFixed(1) });
    signal.textContent = far;
    place.textContent = t('ui.sky.place', { place: placeName });
  };

  render(CONFIG.defaultPlace.lat, CONFIG.defaultPlace.lon, t(CONFIG.defaultPlace.nameKey));
  if ('geolocation' in navigator) {
    button('btn alt small', t('ui.sky.useMine'), () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => render(pos.coords.latitude, pos.coords.longitude, t('ui.sky.yourPlace')),
        () => undefined, // permission refused: keep showing the default city
        { timeout: 8000 },
      );
    }, card);
  }
  return card;
}
