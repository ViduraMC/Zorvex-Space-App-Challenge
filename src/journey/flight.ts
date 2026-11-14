/**
 * The sense of speed for the first-person flights: clouds to climb through, speed streaks that
 * stretch as the rocket goes faster, the glow of the engines, and the curved Earth (NASA's Blue
 * Marble) that appears below as the sky turns black.
 */
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  PointLight,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
} from 'three';
import earthMap from '../assets/planets/earth.png';
import { hash } from '../engine/noise';

const STREAKS = 220;
const STREAK_RANGE = 60;
const CLOUDS = 46;
export const EARTH_RADIUS = 3000;

function puff(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  for (let k = 0; k < 9; k++) {
    const x = 40 + hash(k, 3) * 48;
    const y = 44 + hash(k, 5) * 40;
    const r = 22 + hash(k, 7) * 26;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(255,255,255,0.55)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

export interface FlightFx {
  group: Group;
  earth: Group;
  exhaust: PointLight;
  /** Speed 0..1 drives streak length and brightness; dir is the way the scene rushes past. */
  update(dt: number, camera: Vector3, speed: number, dir: Vector3): void;
}

export function createFlightFx(around: Vector3): FlightFx {
  const group = new Group();

  // clouds to climb through, between 40 and 230 units up
  const cloudMat = new SpriteMaterial({ map: puff(), transparent: true, depthWrite: false, opacity: 0.9, fog: false });
  for (let k = 0; k < CLOUDS; k++) {
    const s = new Sprite(cloudMat);
    const a = hash(k, 11) * Math.PI * 2;
    const d = 12 + hash(k, 13) * 90;
    s.position.set(around.x + Math.cos(a) * d, 40 + hash(k, 17) * 190, around.z - 20 + Math.sin(a) * d);
    s.scale.setScalar(30 + hash(k, 19) * 50);
    group.add(s);
  }

  // speed streaks, moved around the camera every frame
  const positions = new Float32Array(STREAKS * 6);
  const seeds = Array.from({ length: STREAKS }, (_, k) => new Vector3(hash(k, 31) - 0.5, hash(k, 33) - 0.5, hash(k, 35) - 0.5).multiplyScalar(STREAK_RANGE));
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(positions, 3));
  const streakMat = new LineBasicMaterial({ color: new Color(0xbfe6ff).multiplyScalar(1.6), transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false });
  const streaks = new LineSegments(geo, streakMat);
  streaks.frustumCulled = false;
  group.add(streaks);

  // engine glow on the ground and in the smoke at ignition
  const exhaust = new PointLight(0xff8a30, 0, 60, 1.6);
  exhaust.position.set(around.x, 0.5, around.z);
  group.add(exhaust);

  // the curved Earth below, with a thin blue edge of atmosphere
  const earth = new Group();
  const map = new TextureLoader().load(earthMap);
  map.colorSpace = SRGBColorSpace;
  earth.add(new Mesh(new SphereGeometry(EARTH_RADIUS, 128, 64), new MeshStandardMaterial({ map, roughness: 0.9, transparent: true, opacity: 0 })));
  earth.add(
    new Mesh(
      new SphereGeometry(EARTH_RADIUS * 1.02, 96, 48),
      new ShaderMaterial({
        uniforms: { strength: { value: 0 } },
        vertexShader:
          'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
        fragmentShader:
          'uniform float strength; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 6.0); gl_FragColor = vec4(vec3(0.3, 0.6, 1.0) * 1.3, f * strength * 0.7); }',
        side: BackSide,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    ),
  );
  earth.position.set(around.x, -EARTH_RADIUS - 1, around.z - 400);
  earth.rotation.set(0.3, 1.4, 0);
  earth.visible = false;
  group.add(earth);

  const tail = new Vector3();
  return {
    group,
    earth,
    exhaust,
    update(dt, camera, speed, dir) {
      streakMat.opacity = Math.min(0.85, speed * 1.1);
      const length = 1 + speed * 26;
      const half = STREAK_RANGE / 2;
      for (let k = 0; k < STREAKS; k++) {
        const p = seeds[k];
        p.addScaledVector(dir, speed * 160 * dt);
        // wrap each streak inside a box around the camera
        for (const axis of ['x', 'y', 'z'] as const) {
          if (p[axis] > half) p[axis] -= STREAK_RANGE;
          if (p[axis] < -half) p[axis] += STREAK_RANGE;
        }
        tail.copy(p).addScaledVector(dir, -length);
        positions.set([camera.x + p.x, camera.y + p.y, camera.z + p.z, camera.x + tail.x, camera.y + tail.y, camera.z + tail.z], k * 6);
      }
      geo.attributes.position.needsUpdate = true;
    },
  };
}
