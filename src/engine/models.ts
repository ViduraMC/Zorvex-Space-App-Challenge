/**
 * Machines: shared PBR materials, small building helpers, the GLB loader (meshopt-compressed
 * models from an episode's assets/ folder) and the Machine class that drives, tilts, leaves wheel
 * tracks and "talks". When an episode has no model yet, a stand-in probe is built in code so the
 * episode is playable from its first minute.
 */
import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  Quaternion,
  SphereGeometry,
  Vector3,
} from 'three';
import type { BufferGeometry, Material, Object3D, Scene } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import gsap from 'gsap';
import { canvasTexture, solarCells } from './textures';

const glbUrls = import.meta.glob<string>('../episodes/*/assets/*.glb', {
  eager: true,
  query: '?url',
  import: 'default',
});

export interface MachineMaterials {
  gold: MeshStandardMaterial;
  alu: MeshStandardMaterial;
  dark: MeshStandardMaterial;
  white: MeshStandardMaterial;
  fabric: MeshStandardMaterial;
  solar: MeshStandardMaterial;
  /** Camera lenses double as the machine's glowing "eyes". Cloned per machine. */
  lens: MeshStandardMaterial;
}

export function createMaterials(anisotropy: number): MachineMaterials {
  return {
    gold: new MeshStandardMaterial({ color: 0xc79a2c, metalness: 0.9, roughness: 0.36 }),
    alu: new MeshStandardMaterial({ color: 0xc4c8ce, metalness: 0.92, roughness: 0.42 }),
    dark: new MeshStandardMaterial({ color: 0x18191d, metalness: 0.4, roughness: 0.6 }),
    white: new MeshStandardMaterial({ color: 0xd2cec4, metalness: 0.1, roughness: 0.7 }),
    fabric: new MeshStandardMaterial({ color: 0xb3a384, metalness: 0, roughness: 1 }),
    solar: new MeshStandardMaterial({
      map: canvasTexture(256, solarCells, true, anisotropy),
      metalness: 0.55,
      roughness: 0.3,
    }),
    lens: new MeshStandardMaterial({
      color: 0x0a0a0c,
      metalness: 0.9,
      roughness: 0.15,
      emissive: new Color(0xffc266),
      emissiveIntensity: 0.2,
    }),
  };
}

/** Add a shadow-casting mesh to a parent at a position. */
export function part(parent: Object3D, geo: BufferGeometry, mat: Material, x = 0, y = 0, z = 0): Mesh {
  const mesh = new Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

const UP = new Vector3(0, 1, 0);

/** A strut between two points. */
export function tube(parent: Object3D, a: Vector3, b: Vector3, radius: number, mat: Material): Mesh {
  const dir = new Vector3().subVectors(b, a);
  const length = dir.length();
  const mesh = part(parent, new CylinderGeometry(radius, radius, length, 8), mat, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
  return mesh;
}

export interface MachineParts {
  root: Group;
  /** Inner group that pitches on slopes and bobs while talking. Forward is +x. */
  body: Group;
  /** Height above the ground where the speech bubble's tail should point. */
  bubbleHeight: number;
  wheels?: Object3D[];
  wheelRadius?: number;
  /** Half the distance between left and right wheels; set it to leave wheel tracks. */
  trackHalfWidth?: number;
  eyes?: MeshStandardMaterial;
  lamp?: PointLight;
}

const MAX_TRACK_MARKS = 1400;
const TRACK_STEP = 0.055;
const TRACK_COLOR = 0x3a1c10;

export class Machine {
  readonly root: Group;
  readonly parts: MachineParts;
  x = 0;
  z = 0;
  heading = 0;
  /** 0..1: how brightly the eyes and lamp glow (falls as the story ends). */
  power = 1;
  talking = false;
  moving = false;
  /** Height above the ground in metres (hops in low gravity, flight). */
  lift = 0;
  /** Ground height under the machine; a scene may wrap it (for example to add a ramp). */
  groundAt: (x: number, z: number) => number;
  /** Return false where wheels should leave no track (for example on a metal ramp). */
  leavesTracksAt: (x: number, z: number) => boolean = () => true;
  #pitch = 0;
  #lastX = 0;
  #lastZ = 0;
  #sinceMark = 0;
  #marks = 0;
  readonly #tracks: InstancedMesh | null = null;
  readonly #m4 = new Matrix4();
  readonly #quat = new Quaternion();
  readonly #at = new Vector3();
  readonly #one = new Vector3(1, 1, 1);

  constructor(parts: MachineParts, scene: Scene, groundAt: (x: number, z: number) => number) {
    this.parts = parts;
    this.root = parts.root;
    this.groundAt = groundAt;
    scene.add(this.root);
    if (parts.trackHalfWidth) {
      const mark = new PlaneGeometry(0.07, 0.05);
      mark.rotateX(-Math.PI / 2);
      this.#tracks = new InstancedMesh(
        mark,
        new MeshBasicMaterial({ color: TRACK_COLOR, transparent: true, opacity: 0.55, depthWrite: false }),
        MAX_TRACK_MARKS,
      );
      this.#tracks.count = 0;
      this.#tracks.frustumCulled = false;
      scene.add(this.#tracks);
    }
  }

  place(x: number, z: number, heading = this.heading): void {
    gsap.killTweensOf(this);
    this.x = this.#lastX = x;
    this.z = this.#lastZ = z;
    this.heading = heading;
  }

  /** Turn towards a point, then drive to it in a straight line. */
  async driveTo(x: number, z: number, ms: number): Promise<void> {
    gsap.killTweensOf(this);
    let turn = Math.atan2(-(z - this.z), x - this.x) - this.heading;
    while (turn > Math.PI) turn -= Math.PI * 2;
    while (turn < -Math.PI) turn += Math.PI * 2;
    if (Math.abs(turn) > 0.05) {
      await gsap.to(this, { heading: this.heading + turn, duration: 0.5 + Math.abs(turn) * 0.5, ease: 'sine.inOut' });
    }
    await gsap.to(this, { x, z, duration: ms / 1000, ease: 'sine.inOut' });
  }

  stop(): void {
    gsap.killTweensOf(this);
  }

  /** World position for the speech-bubble tail. */
  bubblePoint(out: Vector3): Vector3 {
    return out.set(this.x, this.root.position.y + this.parts.bubbleHeight, this.z);
  }

  clearTracks(): void {
    this.#marks = 0;
    if (this.#tracks) this.#tracks.count = 0;
  }

  update(dt: number, time: number): void {
    const { body, wheels, wheelRadius = 1, trackHalfWidth, eyes, lamp } = this.parts;
    const fx = Math.cos(this.heading);
    const fz = -Math.sin(this.heading);
    const y = this.groundAt(this.x, this.z);
    // pitch follows the slope under the wheels, so ramps and bumps tilt the body
    const reach = 0.25;
    const slope = Math.atan2(
      this.groundAt(this.x + fx * reach, this.z + fz * reach) - this.groundAt(this.x - fx * reach, this.z - fz * reach),
      reach * 2,
    );
    this.#pitch += (slope - this.#pitch) * Math.min(1, dt * 6);
    this.root.position.set(this.x, y + this.lift, this.z);
    this.root.rotation.y = this.heading;
    body.rotation.z = this.#pitch;
    body.position.y = this.talking ? Math.abs(Math.sin(time * 9) * 0.006) : 0;

    const moved = Math.hypot(this.x - this.#lastX, this.z - this.#lastZ);
    this.moving = moved > 0.0002;
    if (moved > 0) {
      if (wheels) for (const w of wheels) w.rotation.z -= moved / wheelRadius;
      this.#sinceMark += moved;
      const tracks = this.#tracks;
      if (tracks && trackHalfWidth && this.#sinceMark > TRACK_STEP && this.#marks < MAX_TRACK_MARKS - 2 && this.lift < 0.01 && this.leavesTracksAt(this.x, this.z)) {
        this.#sinceMark = 0;
        this.#quat.setFromAxisAngle(UP, this.heading);
        for (const side of [-1, 1]) {
          const ox = Math.sin(this.heading) * trackHalfWidth * side;
          const oz = Math.cos(this.heading) * trackHalfWidth * side;
          this.#at.set(this.x + ox, this.groundAt(this.x + ox, this.z + oz) + 0.006, this.z + oz);
          tracks.setMatrixAt(this.#marks++, this.#m4.compose(this.#at, this.#quat, this.#one));
        }
        tracks.count = this.#marks;
        tracks.instanceMatrix.needsUpdate = true;
      }
    }
    this.#lastX = this.x;
    this.#lastZ = this.z;

    const flicker = this.talking ? Math.sin(time * 9) * 0.5 : 0;
    if (eyes) eyes.emissiveIntensity = 0.15 + this.power * (1.6 + flicker);
    if (lamp) lamp.intensity = this.power * (0.6 + flicker * 0.4);
  }

  dispose(): void {
    gsap.killTweensOf(this);
  }
}

/** Load an optimised GLB from an episode's assets/ folder. Null when it is missing or broken. */
export async function loadGlb(episodeId: string, file: string): Promise<Group | null> {
  const url = glbUrls[`../episodes/${episodeId}/assets/${file}`];
  if (!url) return null;
  try {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const gltf = await loader.loadAsync(url);
    gltf.scene.traverse((o) => {
      o.castShadow = true;
      o.receiveShadow = true;
    });
    return gltf.scene;
  } catch (err) {
    console.warn(`[models] could not load ${file}; using the stand-in machine`, err);
    return null;
  }
}

/** Wrap a loaded model as machine parts, with a soft lamp as its "eye". */
export function partsFromModel(model: Group, scale: number, bubbleHeight: number): MachineParts {
  const root = new Group();
  const body = new Group();
  model.scale.setScalar(scale);
  body.add(model);
  root.add(body);
  const lamp = new PointLight(0xffd29a, 0, 4, 2);
  lamp.position.set(0, bubbleHeight * 0.8, 0);
  body.add(lamp);
  return { root, body, bubbleHeight, lamp };
}

/** Stand-in probe: a foil box with a solar deck, a mast and two glowing eyes. */
export function buildPlaceholder(mats: MachineMaterials): MachineParts {
  const root = new Group();
  const body = new Group();
  root.add(body);
  const eyes = mats.lens.clone();
  part(body, new BoxGeometry(0.5, 0.3, 0.4), mats.gold, 0, 0.3, 0);
  part(body, new BoxGeometry(0.7, 0.02, 0.56), mats.solar, 0, 0.47, 0);
  for (const side of [-1, 1]) {
    const eye = part(body, new SphereGeometry(0.035, 14, 10), eyes, 0.26, 0.34, side * 0.09);
    eye.castShadow = false;
    tube(body, new Vector3(-0.15, 0, side * 0.15), new Vector3(-0.15, 0.16, side * 0.15), 0.02, mats.alu);
    tube(body, new Vector3(0.15, 0, side * 0.15), new Vector3(0.15, 0.16, side * 0.15), 0.02, mats.alu);
  }
  tube(body, new Vector3(-0.18, 0.47, 0), new Vector3(-0.18, 0.95, 0), 0.008, mats.dark);
  return { root, body, bubbleHeight: 0.75, eyes };
}
