/**
 * Official NASA 3D models (https://science.nasa.gov/3d-resources/), compressed with
 * `gltf-transform optimize --compress meshopt --texture-compress webp`. Each one is loaded once,
 * then cloned. If a file fails to load, callers fall back to a built-in stand-in.
 * Where each model came from is listed in docs/RESOURCES.md and on the About page.
 */
import { Box3, Group, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, NearestFilter, Texture, Vector3 } from 'three';
import type { Material, Object3D } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import apolloLunarModule from '../assets/models/apollo-lunar-module.glb?url';
import crewEscapeSuit from '../assets/models/crew-escape-suit.glb?url';
import ingenuity from '../assets/models/ingenuity.glb?url';
import insightLander from '../assets/models/insight-lander.glb?url';
import merOpportunity from '../assets/models/mer-opportunity.glb?url';
import pioneer10 from '../assets/models/pioneer-10.glb?url';
import saturnV from '../assets/models/saturn-v.glb?url';
import vikingLander from '../assets/models/viking-lander.glb?url';

export const NASA_MODELS = {
  'saturn-v': { url: saturnV, page: 'https://science.nasa.gov/3d-resources/saturn-v/', title: 'Saturn V' },
  'crew-escape-suit': {
    url: crewEscapeSuit,
    page: 'https://science.nasa.gov/3d-resources/advanced-crew-escape-suit/',
    title: 'Advanced Crew Escape Suit',
  },
  'viking-lander': { url: vikingLander, page: 'https://science.nasa.gov/3d-resources/viking-lander/', title: 'Viking Lander' },
  'insight-lander': {
    url: insightLander,
    page: 'https://science.nasa.gov/3d-resources/insight-cruise-lander/',
    title: 'InSight Cruise Lander (panels deployed)',
  },
  ingenuity: { url: ingenuity, page: 'https://science.nasa.gov/3d-resources/ingenuity-mars-helicopter/', title: 'Ingenuity Mars Helicopter' },
  'apollo-lunar-module': {
    url: apolloLunarModule,
    page: 'https://science.nasa.gov/3d-resources/apollo-lunar-module/',
    title: 'Apollo Lunar Module',
  },
  'mer-opportunity': {
    url: merOpportunity,
    page: 'https://science.nasa.gov/3d-resources/mars-exploration-rover-opportunity-mer-b/',
    title: 'Mars Exploration Rover - Opportunity (MER-B)',
  },
  'pioneer-10': { url: pioneer10, page: 'https://science.nasa.gov/3d-resources/pioneer/', title: 'Pioneer 10' },
} as const;
export type NasaModel = keyof typeof NASA_MODELS;

const cache = new Map<NasaModel, Promise<Group | null>>();
let loader: GLTFLoader | null = null;

/** Start loading (once). Resolves to null when the file cannot be loaded. */
export function loadNasaModel(key: NasaModel): Promise<Group | null> {
  let pending = cache.get(key);
  if (!pending) {
    loader ??= new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    pending = loader
      .loadAsync(NASA_MODELS[key].url)
      .then((gltf) => {
        gltf.scene.traverse((o) => {
          o.castShadow = true;
          o.receiveShadow = true;
          o.userData.shared = true; // geometry is shared by every clone: never dispose it
          if (o instanceof Mesh) fixMaterial(o.material as MeshStandardMaterial);
        });
        return gltf.scene;
      })
      .catch((err: unknown) => {
        console.warn(`[models] could not load ${key}; using the stand-in`, err);
        return null;
      });
    cache.set(key, pending);
  }
  return pending;
}

/**
 * Two export quirks in some NASA models:
 *  - the material is marked fully transmissive (glass), which renders it dark in our scenes;
 *  - parts are coloured from a tiny palette strip (for example 64 x 4 pixels), which smoothing
 *    and mipmaps blend into grey, so those textures are sampled sharp.
 */
function fixMaterial(material: MeshStandardMaterial): void {
  if (material instanceof MeshPhysicalMaterial) material.transmission = 0;
  const map: Texture | null = material.map;
  const image = map?.image as { width?: number; height?: number } | undefined;
  if (!map || !image?.width || !image.height || Math.min(image.width, image.height) > 16) return;
  map.minFilter = map.magFilter = NearestFilter;
  map.generateMipmaps = false;
  map.needsUpdate = true;
}

export interface FitOptions {
  /** Size of the largest side ("size") or of the height only ("height"), in metres. */
  size: number;
  by?: 'size' | 'height';
  /** Hide parts that sit above this share of the height (e.g. the Apollo ascent stage). */
  keepBelow?: number;
  /** Darken and dust the materials: a machine that has been silent for years. */
  dusty?: { color: number; amount: number };
}

const box = new Box3();
const size = new Vector3();
const centre = new Vector3();

/**
 * Move every mesh whose centre sits above `share` of the model's height into a new group (added
 * to `model`'s parent, world positions kept), so it can move on its own: the Apollo ascent stage
 * lifting off its descent stage. `model` must already be in the scene.
 */
export function splitAbove(model: Object3D, share: number): Group {
  model.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(model);
  const cut = bounds.min.y + (bounds.max.y - bounds.min.y) * share;
  const upper: Mesh[] = [];
  model.traverse((o) => {
    if (o instanceof Mesh && new Box3().setFromObject(o).getCenter(centre).y > cut) upper.push(o);
  });
  const group = new Group();
  model.parent?.add(group);
  for (const mesh of upper) group.attach(mesh);
  return group;
}

/** A clone standing on the ground (y = 0), centred, scaled to the requested size. */
export async function nasaModel(key: NasaModel, fit: FitOptions): Promise<Group | null> {
  const source = await loadNasaModel(key);
  if (!source) return null;
  const model = source.clone(true);
  if (fit.keepBelow != null) {
    box.setFromObject(model).getSize(size);
    const cut = box.min.y + size.y * fit.keepBelow;
    model.traverse((o: Object3D) => {
      if (!(o instanceof Mesh)) return;
      const part = new Box3().setFromObject(o);
      if (part.getCenter(centre).y > cut) o.visible = false;
    });
  }
  if (fit.dusty) {
    const { color, amount } = fit.dusty;
    model.traverse((o: Object3D) => {
      if (!(o instanceof Mesh)) return;
      const dust = (m: Material): Material => {
        if (!(m instanceof MeshStandardMaterial)) return m;
        const c = m.clone();
        c.color.lerp(c.color.clone().setHex(color), amount).multiplyScalar(0.6);
        c.roughness = Math.max(c.roughness, 0.9);
        c.metalness *= 0.4;
        return c;
      };
      o.material = Array.isArray(o.material) ? o.material.map(dust) : dust(o.material);
    });
  }
  // measure only what is visible
  box.makeEmpty();
  model.updateMatrixWorld(true);
  model.traverseVisible((o) => {
    if (o instanceof Mesh) box.expandByObject(o);
  });
  box.getSize(size);
  box.getCenter(centre);
  const scale = fit.size / ((fit.by ?? 'size') === 'height' ? size.y : Math.max(size.x, size.y, size.z));
  model.scale.setScalar(scale);
  model.position.set(-centre.x * scale, -box.min.y * scale, -centre.z * scale);
  const holder = new Group();
  holder.add(model);
  return holder;
}
