/**
 * Anatomy 360°: one NASA model on a turntable. The child turns it (drag, or arrow keys through
 * the part list) and taps a numbered part to see what it did and the science it made possible.
 * Parts and their sources: src/data/anatomy.json. Text: anatomy keys in src/i18n/<lang>.json.
 */
import {
  Box3,
  BoxGeometry,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  CircleGeometry,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  RingGeometry,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import type { Group, Object3D } from 'three';
import CameraControls from 'camera-controls';
import anatomy from '../data/anatomy.json';
import { button, el, link } from '../dom';
import { useEpisode, t } from '../engine/i18n';
import { NASA_MODELS, nasaModel, type NasaModel } from '../journey/nasaModels';
import { go } from '../engine/router';
import { langSelect } from './chrome';

interface Part {
  id: string;
  /** Where the pin sits, as a share (0..1) of the fitted model's box on each axis. */
  at: number[];
  fact: { text: string; source: string };
}
interface Anatomy {
  size: number;
  /** Where the camera looks (share of the box); default the centre. */
  focus?: number[];
  /** Camera distance multiplier; below 1 is closer. */
  zoom?: number;
  /** A spacecraft in space: no floor under it. */
  space?: boolean;
  by: 'size' | 'height';
  parts: Part[];
}

const DATA = anatomy as Record<string, Anatomy>;
const REDUCED_MOTION = matchMedia('(prefers-reduced-motion: reduce)').matches;
const AUTO_TURN = 0.18; // radians per second while nobody is touching it

/** The model vertex closest to a point, so every pin sits on the machine itself. */
function nearestPoint(model: Object3D, target: Vector3): Vector3 {
  const best = target.clone();
  const v = new Vector3();
  let bestD = Infinity;
  model.updateMatrixWorld(true);
  model.traverseVisible((o) => {
    if (!(o instanceof Mesh)) return;
    const pos = o.geometry.getAttribute('position');
    const step = Math.max(1, Math.floor(pos.count / 4000)); // shortcut: samples big meshes, fine for pin placement
    for (let i = 0; i < pos.count; i += step) {
      v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
      const d = v.distanceToSquared(target);
      if (d < bestD) {
        bestD = d;
        best.copy(v);
      }
    }
  });
  return best;
}

export const hasAnatomy = (key: string): boolean => key in DATA;

export function anatomyPage(root: HTMLElement, key: string): () => void {
  const data = DATA[key];
  const page = el('main', 'anatomy', undefined, root);
  if (!data || !(key in NASA_MODELS)) {
    el('p', 'anatomy-missing', t('ui.story.soon'), page);
    return () => undefined;
  }
  useEpisode('');
  const model = NASA_MODELS[key as NasaModel];

  // ---------- layout ----------
  const stage = el('div', 'anatomy-stage', undefined, page);
  const pins = el('div', 'anatomy-pins', undefined, stage);
  const panel = el('aside', 'anatomy-panel', undefined, page);
  const bar = el('nav', 'anatomy-bar', undefined, panel);
  bar.setAttribute('aria-label', t('ui.menu'));
  // opened from a link inside the app: back returns there; opened directly: back goes Home
  button('chip', `← ${t('ui.parts.back')}`, () => (history.length > 1 ? history.back() : go('#home')), bar);
  link('chip', t('ui.home'), '#home', bar);
  langSelect(bar, 'chip');
  el('h1', 'anatomy-title', model.title, panel);
  el('p', 'anatomy-hint', t('ui.parts.hint'), panel);
  const list = el('ol', 'anatomy-list', undefined, panel);
  list.setAttribute('aria-label', t('ui.parts.list'));
  const card = el('section', 'anatomy-card', undefined, panel);
  card.setAttribute('aria-live', 'polite');
  link('anatomy-credit', t('ui.parts.model'), model.page, panel);

  // ---------- 3D ----------
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  stage.prepend(renderer.domElement);
  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.05, 200);
  scene.add(new HemisphereLight(0xdfe8ff, 0x2a2420, 1.6));
  const key1 = new DirectionalLight(0xffffff, 2.6);
  key1.position.set(4, 6, 5);
  const rim = new DirectionalLight(0x9fc4ff, 1.4);
  rim.position.set(-5, 3, -4);
  scene.add(key1, rim);
  const floor = new Mesh(new CircleGeometry(1, 64), new MeshStandardMaterial({ color: 0x1b1d24, roughness: 0.95 }));
  floor.rotation.x = -Math.PI / 2;
  const ring = new Mesh(new RingGeometry(0.98, 1, 96), new MeshStandardMaterial({ color: 0x6fd3ff, emissive: 0x2a89b8 }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.002;
  scene.add(floor, ring);

  const controls = new CameraControls(camera, renderer.domElement);
  controls.minPolarAngle = 0.15;
  controls.maxPolarAngle = Math.PI * 0.55;
  controls.smoothTime = 0.25;

  const anchors: { part: Part; at: Vector3; pin: HTMLButtonElement; item: HTMLButtonElement }[] = [];
  let turntable: Group | null = null;
  let touched = false;
  const focus = new Vector3();
  controls.addEventListener('controlstart', () => (touched = true));

  const select = (index: number): void => {
    const a = anchors[index];
    if (!a) return;
    for (const other of anchors) {
      other.pin.classList.toggle('on', other === a);
      other.item.setAttribute('aria-pressed', String(other === a));
    }
    const base = `parts.${key}.${a.part.id}`;
    card.replaceChildren();
    el('h2', '', `${index + 1}. ${t(`${base}.name`)}`, card);
    el('b', '', t('ui.parts.job'), card);
    el('p', '', t(`${base}.job`), card);
    el('b', '', t('ui.parts.science'), card);
    el('p', '', t(`${base}.science`), card);
    const src = link('anatomy-source', t('ui.parts.source'), a.part.fact.source, card);
    src.title = a.part.fact.text;
    // swing the camera round to face the part
    touched = true;
    const dir = a.at.clone().sub(focus).setY(0);
    if (dir.lengthSq() < 1e-4) dir.set(0, 0, 1);
    dir.normalize();
    const dist = controls.distance;
    const look = focus.clone().lerp(a.at, 0.5);
    void controls.setLookAt(look.x + dir.x * dist, look.y + dist * 0.3, look.z + dir.z * dist, look.x, look.y, look.z, !REDUCED_MOTION);
  };

  void nasaModel(key as NasaModel, { size: data.size, by: data.by }).then((holder) => {
    if (!holder || disposed) return;
    turntable = holder;
    scene.add(holder);
    const box = new Box3().setFromObject(holder);
    const size = box.getSize(new Vector3());
    const radius = Math.max(size.x, size.z) * 0.62 + 0.2;
    floor.scale.setScalar(radius);
    ring.scale.setScalar(radius);
    floor.visible = ring.visible = !data.space;
    const share = (f: number[]): Vector3 => new Vector3(box.min.x + size.x * f[0], box.min.y + size.y * f[1], box.min.z + size.z * f[2]);
    const centre = focus.copy(share(data.focus ?? [0.5, 0.5, 0.5]));
    const dist = Math.max(size.x, size.y, size.z) * 1.9 * (data.zoom ?? 1);
    controls.setTarget(centre.x, centre.y, centre.z, false);
    void controls.setLookAt(centre.x + dist * 0.7, centre.y + dist * 0.3, centre.z + dist * 0.7, centre.x, centre.y, centre.z, false);
    controls.minDistance = dist * 0.35;
    controls.maxDistance = dist * 1.8;
    data.parts.forEach((part, i) => {
      const at = nearestPoint(holder, share(part.at));
      const label = t(`parts.${key}.${part.id}.name`);
      const pin = button('anatomy-pin', String(i + 1), () => select(i), pins);
      pin.setAttribute('aria-label', label);
      const li = el('li', '', undefined, list);
      const item = button('anatomy-item', `${i + 1}. ${label}`, () => select(i), li);
      item.setAttribute('aria-pressed', 'false');
      anchors.push({ part, at, pin, item });
    });
    select(0);
    touched = false;
    if (import.meta.env.DEV) devView(box);
  });

  /** Dev only: ?view=front|side|top fixes the camera so pins can be placed by eye (box quarters drawn). */
  function devView(box: Box3): void {
    const view = new URLSearchParams(location.search).get('view');
    if (!view) return;
    touched = true;
    const c = box.getCenter(new Vector3());
    const s = box.getSize(new Vector3());
    const d = Math.max(s.x, s.y, s.z) * 2.4;
    const eye = view === 'side' ? [c.x + d, c.y, c.z] : view === 'top' ? [c.x, c.y + d, c.z + 0.001] : [c.x, c.y, c.z + d];
    void controls.setLookAt(eye[0], eye[1], eye[2], c.x, c.y, c.z, false);
    controls.maxPolarAngle = Math.PI;
    controls.minPolarAngle = 0;
    const lines = new LineSegments(new EdgesGeometry(new BoxGeometry(s.x, s.y, s.z, 4, 4, 4)), new LineBasicMaterial({ color: 0xff00ff }));
    lines.position.copy(c);
    scene.add(lines);
  }

  // ---------- loop ----------
  const resize = (): void => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(stage);
  resize();

  const projected = new Vector3();
  let last = performance.now();
  let frame = 0;
  let disposed = false;
  const tick = (now: number): void => {
    frame = requestAnimationFrame(tick);
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (turntable && !touched && !REDUCED_MOTION) void controls.rotate(AUTO_TURN * dt, 0, false);
    controls.update(dt);
    renderer.render(scene, camera);
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    for (const a of anchors) {
      projected.copy(a.at).project(camera);
      const hidden = projected.z > 1;
      a.pin.style.transform = `translate(${((projected.x + 1) / 2) * w}px, ${((1 - projected.y) / 2) * h}px) translate(-50%, -50%)`;
      a.pin.hidden = hidden;
    }
  };
  frame = requestAnimationFrame(tick);

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    controls.dispose();
    renderer.dispose();
    scene.traverse((o) => {
      if (o instanceof Mesh && !o.userData.shared) o.geometry.dispose();
    });
  };
}
