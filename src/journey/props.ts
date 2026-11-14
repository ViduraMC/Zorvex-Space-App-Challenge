/**
 * Placeholder 3D props for the opening journey, all built from primitives: star field, shooting
 * stars, desert, rocket, child, planets and stand-in explorer models. Real models replace the
 * stand-ins later (BUILD_GUIDE step 15); nothing else has to change.
 */
import {
  AdditiveBlending,
  BackSide,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  CircleGeometry,
  Color,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  Points,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  TextureLoader,
  TorusGeometry,
  Vector2,
  Vector3,
} from 'three';
import type { Object3D } from 'three';
import marsMap from '../assets/planets/mars.jpg';
import moonBump from '../assets/planets/moon_bump.jpg';
import moonMap from '../assets/planets/moon.jpg';
import { part, tube, type MachineMaterials } from '../engine/models';
import { fbm, smooth } from '../engine/noise';
import type { ExplorerType } from './explorers';
import type { Destination } from './store';

export const COLORS = {
  space: 0x05070d,
  duskBlue: 0x16233f,
  hologram: 0x4fd8ff,
  candle: 0xfff3d6,
  active: 0x5be38a,
  thruster: 0xffa040,
};

/** Twinkling stars: every star has its own size and phase. */
export function createStars(count: number, radius: number): { points: Points; material: ShaderMaterial } {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const v = new Vector3();
  for (let i = 0; i < count; i++) {
    v.randomDirection().multiplyScalar(radius);
    positions.set([v.x, v.y, v.z], i * 3);
    sizes[i] = 0.5 + Math.random() * 1.8;
    phases[i] = Math.random();
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('aSize', new BufferAttribute(sizes, 1));
  geometry.setAttribute('aPhase', new BufferAttribute(phases, 1));
  const material = new ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uBright: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float aSize; attribute float aPhase;
      uniform float uTime; varying float vTw;
      void main() {
        vTw = 0.6 + 0.4 * sin(uTime * 1.5 + aPhase * 6.2831);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * vTw * (300.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uBright; varying float vTw;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        gl_FragColor = vec4(vec3(0.85, 0.9, 1.0) * uBright, smoothstep(0.5, 0.0, d) * vTw);
      }`,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  return { points, material };
}

const STREAK_POOL = 3;
const STREAK_SPEED = 60;
const STREAK_LIFE_S = 0.8;

/** A pool of three shooting stars; one appears every 4 to 9 seconds. */
export function createShootingStars(): { group: Group; update: (dt: number) => void } {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 4;
  const g = canvas.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 128, 0);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(1, 'rgba(255,255,255,1)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 4);
  const map = new CanvasTexture(canvas);
  const group = new Group();
  const streaks = Array.from({ length: STREAK_POOL }, () => {
    const mesh = new Mesh(
      new PlaneGeometry(9, 0.12),
      new MeshBasicMaterial({ map, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, fog: false }),
    );
    mesh.visible = false;
    group.add(mesh);
    return { mesh, life: 0, dir: new Vector2() };
  });
  let wait = 2;
  return {
    group,
    update(dt) {
      wait -= dt;
      const free = streaks.find((s) => s.life <= 0);
      if (wait <= 0 && free) {
        wait = 4 + Math.random() * 5;
        const angle = Math.PI * (1.08 + Math.random() * 0.3) * (Math.random() > 0.5 ? 1 : -0.1);
        free.dir.set(Math.cos(angle), -Math.abs(Math.sin(angle)) - 0.2).normalize();
        free.mesh.position.set((Math.random() - 0.5) * 120, 30 + Math.random() * 30, -100);
        free.mesh.rotation.z = Math.atan2(free.dir.y, free.dir.x);
        free.life = STREAK_LIFE_S;
        free.mesh.visible = true;
      }
      for (const s of streaks) {
        if (s.life <= 0) continue;
        s.life -= dt;
        s.mesh.position.x += s.dir.x * STREAK_SPEED * dt;
        s.mesh.position.y += s.dir.y * STREAK_SPEED * dt;
        s.mesh.material.opacity = Math.max(0, Math.sin((s.life / STREAK_LIFE_S) * Math.PI));
        if (s.life <= 0) s.mesh.visible = false;
      }
    },
  };
}

/** Night sky dome: a vertical gradient with a soft glow on the horizon. */
export function createNightSky(): { mesh: Mesh; top: Color; bottom: Color } {
  const top = new Color(COLORS.space);
  const bottom = new Color(COLORS.duskBlue);
  const mesh = new Mesh(
    new SphereGeometry(900, 32, 16),
    new ShaderMaterial({
      uniforms: { top: { value: top }, bottom: { value: bottom } },
      vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader:
        'uniform vec3 top; uniform vec3 bottom; varying vec3 vDir; void main(){ float h = clamp(normalize(vDir).y, 0.0, 1.0); gl_FragColor = vec4(mix(bottom, top, pow(h, 0.35)), 1.0); }',
      side: BackSide,
      depthWrite: false,
      fog: false,
    }),
  );
  mesh.renderOrder = -1;
  return { mesh, top, bottom };
}

/** A dark desert with gentle dunes, flat where the rocket stands. */
export function createDesert(): Mesh {
  const geo = new PlaneGeometry(1600, 1600, 160, 160);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i);
    p.setY(i, (fbm(x * 0.02 + 5, z * 0.02 + 9) - 0.5) * 7 * smooth(8, 70, Math.hypot(x, z)));
  }
  geo.computeVertexNormals();
  return new Mesh(geo, new MeshStandardMaterial({ color: 0x3a3028, roughness: 1, metalness: 0 }));
}

export interface Rocket {
  group: Group;
  door: Mesh;
  glow: PointLight;
}

export function createRocket(): Rocket {
  const group = new Group();
  const hull = new MeshStandardMaterial({ color: 0xe9e6df, roughness: 0.45, metalness: 0.3 });
  const trim = new MeshStandardMaterial({ color: 0xc8402e, roughness: 0.5, metalness: 0.2 });
  const profile = [
    [0, 0],
    [0.55, 0],
    [0.62, 0.5],
    [0.62, 2.7],
    [0.42, 3.5],
    [0, 4.3],
  ].map(([x, y]) => new Vector2(x, y));
  part(group, new LatheGeometry(profile, 32), hull);
  for (let i = 0; i < 3; i++) {
    const fin = part(group, new BoxGeometry(0.75, 1.1, 0.06), trim, 0.8, 0.5, 0);
    const holder = new Group();
    holder.rotation.y = (i / 3) * Math.PI * 2 + 0.5;
    holder.add(fin);
    group.add(holder);
  }
  const glass = new MeshStandardMaterial({ color: 0x0b1c2a, emissive: new Color(COLORS.hologram), emissiveIntensity: 1.6 });
  part(group, new CircleGeometry(0.2, 24), glass, 0, 2.7, 0.625);
  // the doorway faces the child (−x); the door swings shut over it
  const doorway = part(group, new PlaneGeometry(0.5, 1.0), new MeshBasicMaterial({ color: 0x06080c }), -0.625, 0.75, 0);
  doorway.rotation.y = -Math.PI / 2;
  const door = part(group, new BoxGeometry(0.04, 1.0, 0.5), hull, -0.64, 0.75, 0);
  door.position.z = 0.52; // open: slid to one side
  const glow = new PointLight(COLORS.thruster, 6, 9, 2);
  glow.position.set(0, 0.25, 0);
  group.add(glow);
  part(group, new CircleGeometry(0.5, 24), new MeshBasicMaterial({ color: COLORS.thruster }), 0, 0.02, 0).rotation.x = -Math.PI / 2;
  return { group, door, glow };
}

export interface Child {
  group: Group;
  head: Mesh;
  legs: Group[];
}

/** A small, friendly figure about one metre tall. */
export function createChild(): Child {
  const group = new Group();
  const suit = new MeshStandardMaterial({ color: 0xf2b23a, roughness: 0.8 });
  const skin = new MeshStandardMaterial({ color: 0xc98c62, roughness: 0.9 });
  const dark = new MeshStandardMaterial({ color: 0x2b2f3a, roughness: 0.8 });
  part(group, new CapsuleGeometry(0.15, 0.3, 6, 12), suit, 0, 0.62, 0);
  part(group, new BoxGeometry(0.2, 0.26, 0.1), dark, 0, 0.66, -0.17);
  const head = part(group, new SphereGeometry(0.15, 20, 14), skin, 0, 1.02, 0);
  const legs = [-0.07, 0.07].map((x) => {
    const hip = new Group();
    hip.position.set(x, 0.42, 0);
    part(hip, new CapsuleGeometry(0.055, 0.28, 4, 8), dark, 0, -0.2, 0);
    group.add(hip);
    return hip;
  });
  return { group, head, legs };
}

export interface Planet {
  group: Group;
  globe: Mesh;
  rim: Mesh;
}

/** A rotating world: real NASA imagery on a sphere, with a rim glow that lights up on hover. */
export function createPlanet(kind: Destination, anisotropy: number): Planet {
  const loader = new TextureLoader();
  const map = loader.load(kind === 'moon' ? moonMap : marsMap);
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = anisotropy;
  // hide the one-pixel border column of the source mosaic, which shows as a seam on the globe
  map.repeat.x = 0.996;
  map.offset.x = 0.002;
  // the Moon's relief is real LOLA elevation; Mars reuses its image as a gentle bump
  const bumpMap = loader.load(kind === 'moon' ? moonBump : marsMap);
  const group = new Group();
  const globe = new Mesh(
    new SphereGeometry(1, 64, 48),
    new MeshStandardMaterial({ map, bumpMap, bumpScale: kind === 'moon' ? 2.5 : 1.2, roughness: 1, metalness: 0 }),
  );
  const rim = new Mesh(
    new SphereGeometry(1.035, 48, 32),
    new ShaderMaterial({
      uniforms: { color: { value: new Color(kind === 'moon' ? 0xc9ced6 : 0xe2663a) }, strength: { value: 0 } },
      vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
      fragmentShader:
        'uniform vec3 color; uniform float strength; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 3.0); gl_FragColor = vec4(color * 1.3, f * strength); }',
      side: BackSide,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  );
  group.add(globe, rim);
  return { group, globe, rim };
}

export interface ExplorerModel {
  group: Group;
  /** Parts that turn while the explorer is active (wheels, rotor blades). */
  spinners: { object: Object3D; axis: 'y' | 'z'; speed: number }[];
}

/** Stand-in model for an explorer type, about 1.2 m wide. */
export function createExplorerModel(type: ExplorerType, mats: MachineMaterials): ExplorerModel {
  const group = new Group();
  const spinners: ExplorerModel['spinners'] = [];
  const V = (x: number, y: number, z: number): Vector3 => new Vector3(x, y, z);
  if (type === 'rover') {
    part(group, new BoxGeometry(0.9, 0.24, 0.56), mats.gold, 0, 0.42, 0);
    part(group, new BoxGeometry(1.0, 0.03, 0.66), mats.solar, 0, 0.56, 0);
    tube(group, V(0.3, 0.56, 0), V(0.3, 1.05, 0), 0.025, mats.alu);
    part(group, new BoxGeometry(0.16, 0.1, 0.22), mats.white, 0.32, 1.08, 0);
    const wheel = new CylinderGeometry(0.15, 0.15, 0.12, 18);
    wheel.rotateX(Math.PI / 2);
    for (const x of [-0.36, 0, 0.36]) {
      for (const z of [-0.36, 0.36]) spinners.push({ object: part(group, wheel, mats.dark, x, 0.15, z), axis: 'z', speed: -1.2 });
    }
  } else if (type === 'helicopter') {
    part(group, new BoxGeometry(0.2, 0.18, 0.2), mats.gold, 0, 0.42, 0);
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) tube(group, V(0, 0.36, 0), V(x * 0.3, 0, z * 0.3), 0.012, mats.dark);
    tube(group, V(0, 0.5, 0), V(0, 0.82, 0), 0.015, mats.alu);
    part(group, new BoxGeometry(0.24, 0.015, 0.16), mats.solar, 0, 0.84, 0);
    for (const [y, speed] of [[0.66, 9], [0.74, -9]]) {
      spinners.push({ object: part(group, new BoxGeometry(1.2, 0.012, 0.07), mats.dark, 0, y, 0), axis: 'y', speed });
    }
  } else if (type === 'descent-stage') {
    part(group, new CylinderGeometry(0.62, 0.62, 0.42, 8), mats.gold, 0, 0.62, 0);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      tube(group, V(Math.cos(a) * 0.55, 0.55, Math.sin(a) * 0.55), V(Math.cos(a) * 0.95, 0.04, Math.sin(a) * 0.95), 0.03, mats.alu);
      part(group, new CylinderGeometry(0.13, 0.13, 0.04, 14), mats.alu, Math.cos(a) * 0.95, 0.02, Math.sin(a) * 0.95);
    }
  } else if (type === 'instrument') {
    part(group, new BoxGeometry(0.42, 0.3, 0.42), mats.white, 0, 0.17, 0);
    part(group, new BoxGeometry(0.7, 0.03, 0.5), mats.solar, 0.1, 0.36, 0).rotation.z = 0.35;
    tube(group, V(-0.15, 0.3, 0.1), V(-0.15, 0.95, 0.1), 0.012, mats.alu);
  } else {
    part(group, new CylinderGeometry(0.46, 0.56, 0.3, 6), mats.white, 0, 0.55, 0);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      tube(group, V(Math.cos(a) * 0.45, 0.45, Math.sin(a) * 0.45), V(Math.cos(a) * 0.85, 0.03, Math.sin(a) * 0.85), 0.025, mats.alu);
    }
    for (const side of [-1, 1]) part(group, new CylinderGeometry(0.42, 0.42, 0.02, 10), mats.solar, side * 0.82, 0.6, 0);
    part(group, new CylinderGeometry(0.2, 0.2, 0.02, 18), mats.white, 0, 0.92, 0.1).rotation.x = 0.5;
    tube(group, V(0, 0.7, 0), V(0, 0.9, 0.08), 0.015, mats.alu);
  }
  return { group, spinners };
}

/** The stone plinth every explorer stands on, with a ring that lights up when it is chosen. */
export function createPlinth(): { group: Group; ring: Mesh } {
  const group = new Group();
  part(group, new CylinderGeometry(0.95, 1.05, 0.22, 36), new MeshStandardMaterial({ color: 0x2c2a2a, roughness: 0.9 }), 0, 0.11, 0);
  const ring = part(group, new TorusGeometry(0.98, 0.025, 8, 48), new MeshBasicMaterial({ color: new Color(COLORS.hologram).multiplyScalar(2.5) }), 0, 0.23, 0);
  ring.rotation.x = Math.PI / 2;
  ring.visible = false;
  ring.castShadow = false;
  return { group, ring };
}
