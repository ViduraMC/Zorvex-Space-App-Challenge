/**
 * Screen 3: the surface of the chosen world with its explorers on plinths. It is both a memorial
 * (silent explorers: dimmed, dusty, still, a warm candle light) and a living display (active
 * explorers: fully lit, moving, a green status light).
 */
import { Color, Mesh, MeshBasicMaterial, PointLight, Scene, SphereGeometry, Vector3 } from 'three';
import type { Group, Object3D } from 'three';
import { Fx } from '../engine/fx';
import { createMaterials, type MachineMaterials } from '../engine/models';
import type { Quality } from '../engine/progress';
import { Sky, SKY_PRESETS } from '../engine/sky';
import { createWorld, type World } from '../engine/worlds';
import { explorersOf, type Explorer } from './explorers';
import { nasaModel, type FitOptions, type NasaModel } from './nasaModels';
import { COLORS, createExplorerModel, createPlinth } from './props';
import type { Destination } from './store';

/** True when this explorer is shown with NASA's own 3D model. */
export const hasNasaModel = (id: string): boolean => id in MODEL_OF;

export interface ExplorerItem {
  explorer: Explorer;
  root: Group;
  ring: Mesh;
  light: PointLight;
  spinners: { object: Object3D; axis: 'y' | 'z'; speed: number }[];
  /** Where the name plaque is pinned. */
  plaqueAt: Vector3;
}

export interface Surface {
  destination: Destination;
  scene: Scene;
  world: World;
  sky: Sky;
  fx: Fx;
  items: ExplorerItem[];
  /** Camera position and target that frame every explorer. */
  view: { pos: Vector3; look: Vector3; fov: number };
}

const DUST: Record<Destination, number> = { mars: 0x8a5a3c, moon: 0x6f6d6a };

/**
 * Explorers with an official NASA 3D model (science.nasa.gov/3d-resources). The others keep a
 * built-in stand-in until NASA publishes one. Sizes are the model's largest side on the plinth.
 */
const MODEL_OF: Record<string, { key: NasaModel; fit: Omit<FitOptions, 'dusty'> }> = {
  spirit: { key: 'mer-opportunity', fit: { size: 1.9 } }, // Spirit and Opportunity were identical twins
  opportunity: { key: 'mer-opportunity', fit: { size: 1.9 } },
  'viking-1': { key: 'viking-lander', fit: { size: 2.0 } },
  'viking-2': { key: 'viking-lander', fit: { size: 2.0 } },
  insight: { key: 'insight-lander', fit: { size: 2.5 } },
  ingenuity: { key: 'ingenuity', fit: { size: 1.3 } },
  // only the lower half (the descent stage) stayed on the Moon
  'apollo-11-descent-stage': { key: 'apollo-lunar-module', fit: { size: 2.1, keepBelow: 0.42 } },
};
/** A wide, shallow arc: about 2.5 m between neighbours, the ends only a little farther away. */
const ARC_RADIUS = 30;
const ARC_STEP = 0.085;
const MODEL_SCALE = 1.25;
const GRID_COLUMNS = 3;
const LIGHT_HEIGHT = 1.9;

/** Materials of a machine that has stood silent for years: darker, and coated in local dust. */
function dustyMaterials(anisotropy: number, destination: Destination): MachineMaterials {
  const mats = createMaterials(anisotropy);
  const dust = new Color(DUST[destination]);
  for (const mat of Object.values(mats)) {
    mat.color.lerp(dust, 0.55).multiplyScalar(0.55);
    mat.roughness = 1;
    mat.metalness *= 0.3;
  }
  return mats;
}

/** Wide screens: a gentle arc. Tall (phone) screens: a grid of three columns going back. */
function slotPosition(index: number, count: number, portrait: boolean): [number, number] {
  if (portrait) return [((index % GRID_COLUMNS) - 1) * 2.7, 4 - Math.floor(index / GRID_COLUMNS) * 3.3];
  const angle = (index - (count - 1) / 2) * ARC_STEP;
  return [Math.sin(angle) * ARC_RADIUS, 4 - ARC_RADIUS * (1 - Math.cos(angle))];
}

export function buildSurface(
  destination: Destination,
  quality: Quality,
  anisotropy: number,
  renderer: ConstructorParameters<typeof Sky>[1],
): Surface {
  const scene = new Scene();
  const portrait = window.innerWidth < window.innerHeight;
  const world = createWorld(destination, { quality, anisotropy, clear: { x0: -11, x1: 11, z0: -8, z1: 16 } });
  scene.add(world.group);
  const sky = new Sky(scene, renderer, destination, quality, SKY_PRESETS[destination === 'mars' ? 'marsAfternoon' : 'moonDay']);
  sky.focus.set(0, 0, 2);
  const fx = new Fx(scene, quality);
  const bright = createMaterials(anisotropy);
  const dusty = dustyMaterials(anisotropy, destination);
  const roster = explorersOf(destination);

  const items = roster.map((explorer, i): ExplorerItem => {
    const active = explorer.status === 'active';
    const [x, z] = slotPosition(i, roster.length, portrait);
    const { group: root, ring } = createPlinth();
    root.position.set(x, world.heightAt(x, z), z);
    root.userData.explorerId = explorer.id;
    const model = createExplorerModel(explorer.type, active ? bright : dusty);
    model.group.position.y = 0.22;
    model.group.scale.setScalar(MODEL_SCALE);
    model.group.rotation.y = -0.5;
    root.add(model.group);
    const nasa = MODEL_OF[explorer.id];
    if (nasa) {
      const dusty = active ? undefined : { color: DUST[destination], amount: 0.35 };
      void nasaModel(nasa.key, { ...nasa.fit, dusty }).then((real) => {
        if (!real) return; // keep the stand-in
        real.position.y = 0.22;
        real.rotation.y = -0.5;
        root.remove(model.group);
        root.add(real);
      });
    }
    // memorial: a warm candle. active: a green status light. (The plaque also says which, in words.)
    const color = active ? COLORS.active : COLORS.candle;
    const light = new PointLight(color, active ? 3 : 6, 5, 2);
    light.position.set(0, LIGHT_HEIGHT, 0.4);
    root.add(light);
    const bulb = new Mesh(new SphereGeometry(0.045, 12, 8), new MeshBasicMaterial({ color: new Color(color).multiplyScalar(3) }));
    bulb.position.copy(light.position);
    root.add(bulb);
    scene.add(root);
    return { explorer, root, ring, light, spinners: active ? model.spinners : [], plaqueAt: new Vector3(x, root.position.y + 0.1, z + 1.25) };
  });

  // half the width of the row of plinths, in metres
  const halfRow = Math.sin(((roster.length - 1) / 2) * ARC_STEP) * ARC_RADIUS + 1.4;
  const aspect = window.innerWidth / window.innerHeight;
  const view = portrait
    ? { pos: new Vector3(0, 6, 14), look: new Vector3(0, 0.4, 0.5), fov: 68 }
    : // far enough back that the whole arc fits beside the hologram panel (68% of the width)
      { pos: new Vector3(0, 3.1, 4 + Math.max(9, halfRow / (0.466 * 0.68 * aspect))), look: new Vector3(0, 0.9, 2), fov: 50 };
  return { destination, scene, world, sky, fx, items, view };
}

export function updateSurface(surface: Surface, dt: number, time: number, camera: Parameters<Sky['update']>[0], hoveredId: string | null): void {
  for (const item of surface.items) {
    for (const s of item.spinners) s.object.rotation[s.axis] += s.speed * dt;
    const chosen = item.explorer.id === hoveredId;
    item.ring.visible = chosen;
    const base = item.explorer.status === 'active' ? 3 : 6;
    // candles flicker a little; the chosen explorer's light swells
    const flicker = item.explorer.status === 'active' ? 0 : Math.sin(time * 7 + item.root.position.x) * 0.6;
    item.light.intensity += ((chosen ? base * 2.6 : base) + flicker - item.light.intensity) * Math.min(1, dt * 8);
  }
  surface.world.update(dt, time);
  surface.sky.update(camera);
  surface.fx.update(dt);
}

export function disposeSurface(surface: Surface): void {
  surface.fx.dispose();
  surface.scene.traverse((obj) => {
    if (!(obj instanceof Mesh) || obj.userData.shared) return; // NASA model geometry is shared by every visit
    obj.geometry.dispose();
    for (const mat of Array.isArray(obj.material) ? obj.material : [obj.material]) mat.dispose();
  });
}
