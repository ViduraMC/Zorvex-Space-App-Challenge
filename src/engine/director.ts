/**
 * The camera director. Two modes:
 *  - cinematic (default): scripted shots with exact durations; the child cannot move the camera.
 *  - free orbit: during a play moment the child may look around within limits.
 * camera-controls does the camera maths in both modes; gsap times the scripted moves.
 */
import {
  Box3,
  Matrix4,
  PerspectiveCamera,
  Quaternion,
  Raycaster,
  Sphere,
  Spherical,
  Vector2,
  Vector3,
  Vector4,
} from 'three';
import type { Object3D } from 'three';
import CameraControls from 'camera-controls';
import gsap from 'gsap';
import { CONFIG } from '../config';

CameraControls.install({
  THREE: { Vector2, Vector3, Vector4, Quaternion, Matrix4, Spherical, Box3, Sphere, Raycaster },
});

const MIN_CAMERA_HEIGHT = 0.12;
/** While orbiting, the child cannot push the camera under the horizon. */
const ORBIT_MAX_POLAR = Math.PI * 0.47;

export interface ShotOptions {
  pos: readonly [number, number, number];
  look: readonly [number, number, number];
  /** 0 or omitted = hard cut. */
  ms?: number;
  ease?: string;
}

export class Director {
  readonly camera = new PerspectiveCamera(38, 1, 0.05, 2500);
  readonly controls: CameraControls;
  readonly #pos = new Vector3(3, 0.6, 2);
  readonly #look = new Vector3(0, 0.3, 0);
  readonly #lookNow = new Vector3(0, 0.3, 0);
  readonly #pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  readonly #right = new Vector3();
  readonly #tmp = new Vector3();
  #follow: Object3D | null = null;
  #free = false;
  /** 'comic' keeps the subject right of centre, clear of the words; 'center' is for play moments. */
  #framing: 'comic' | 'center' = 'comic';
  /** Returns the ground height so the camera never dips under the terrain. */
  groundAt: (x: number, z: number) => number = () => 0;

  constructor(dom: HTMLElement) {
    this.controls = new CameraControls(this.camera, dom);
    this.controls.enabled = false;
    this.controls.smoothTime = 0.12;
    this.controls.dollySpeed = 0.5;
    window.addEventListener('pointermove', this.#onPointer);
  }

  #onPointer = (e: PointerEvent): void => {
    this.#pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.#pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };

  /** Scripted camera move. Resolves when the move ends (immediately for a cut). */
  shot({ pos, look, ms = 0, ease = 'sine.inOut' }: ShotOptions): Promise<void> {
    this.release();
    gsap.killTweensOf([this.#pos, this.#look]);
    if (ms <= 0) {
      this.#pos.set(pos[0], pos[1], pos[2]);
      this.#look.set(look[0], look[1], look[2]);
      this.#lookNow.copy(this.#look);
      return Promise.resolve();
    }
    const duration = ms / 1000;
    gsap.to(this.#look, { x: look[0], y: look[1], z: look[2], duration, ease });
    return new Promise((resolve) => {
      gsap.to(this.#pos, { x: pos[0], y: pos[1], z: pos[2], duration, ease, onComplete: resolve });
    });
  }

  /** Keep looking at a moving object (pass null to stop). */
  follow(target: Object3D | null): void {
    this.#follow = target;
  }

  setFraming(framing: 'comic' | 'center'): void {
    this.#framing = framing;
    this.resize();
  }

  /** Let the child orbit around a point, within distance limits, during a play moment. */
  orbit(center: Vector3, minDistance: number, maxDistance: number): void {
    this.#free = true;
    this.controls.maxPolarAngle = ORBIT_MAX_POLAR;
    this.controls.minDistance = minDistance;
    this.controls.maxDistance = maxDistance;
    void this.controls.setLookAt(this.#pos.x, this.#pos.y, this.#pos.z, center.x, center.y, center.z, false);
    this.controls.enabled = true;
  }

  /** Back to cinematic mode, keeping the camera where the child left it. */
  release(): void {
    if (!this.#free) return;
    this.#free = false;
    this.controls.enabled = false;
    // scripted shots may sit below the subject or far away, so lift the orbit limits again
    this.controls.maxPolarAngle = Math.PI;
    this.controls.minDistance = Number.EPSILON;
    this.controls.maxDistance = Infinity;
    this.controls.getPosition(this.#pos);
    this.controls.getTarget(this.#look);
    this.#lookNow.copy(this.#look);
  }

  resize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    if (this.#framing === 'comic') {
      this.camera.setViewOffset(w, h, w > CONFIG.wideLayoutPx ? -0.15 * w : 0, -h * 0.03, w, h);
    } else {
      this.camera.clearViewOffset();
    }
    this.camera.updateProjectionMatrix();
  }

  update(dt: number): void {
    if (this.#free) {
      this.controls.update(dt);
      return;
    }
    if (this.#follow) {
      this.#follow.getWorldPosition(this.#tmp);
      this.#tmp.y += 0.22;
      this.#lookNow.lerp(this.#tmp, Math.min(1, dt * 4));
    } else {
      this.#lookNow.copy(this.#look);
    }
    // a little parallax from the pointer keeps even a held shot alive
    const p = this.#pointer;
    p.sx += (p.x - p.sx) * 0.05;
    p.sy += (p.y - p.sy) * 0.05;
    void this.controls.setLookAt(
      this.#pos.x,
      this.#pos.y,
      this.#pos.z,
      this.#lookNow.x,
      this.#lookNow.y,
      this.#lookNow.z,
      false,
    );
    this.controls.update(dt);
    this.#right.setFromMatrixColumn(this.camera.matrixWorld, 0);
    this.camera.position.addScaledVector(this.#right, p.sx * 0.14);
    this.camera.position.y -= p.sy * 0.07;
    const floor = this.groundAt(this.camera.position.x, this.camera.position.z) + MIN_CAMERA_HEIGHT;
    if (this.camera.position.y < floor) this.camera.position.y = floor;
    this.camera.lookAt(this.#lookNow);
    this.camera.updateMatrixWorld();
  }

  dispose(): void {
    gsap.killTweensOf([this.#pos, this.#look]);
    window.removeEventListener('pointermove', this.#onPointer);
    this.controls.dispose();
  }
}
