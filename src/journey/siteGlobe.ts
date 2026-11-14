/**
 * The small turning globe in the hologram panel: where an explorer landed, on the real NASA map
 * of its world. One small WebGL view, created when first needed and reused for every explorer.
 */
import {
  AdditiveBlending,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  DirectionalLight,
  AmbientLight,
  RingGeometry,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
  WebGLRenderer,
  DoubleSide,
} from 'three';
import type { Texture } from 'three';
import marsMap from '../assets/planets/mars.jpg';
import moonMap from '../assets/planets/moon.jpg';
import { onGlobe } from './geo';
import type { Destination } from './store';

const SIZE_PX = 220;
const MARKER_COLOR = 0x4fd8ff;
const SPIN = 0.25;

export class SiteGlobe {
  readonly canvas = document.createElement('canvas');
  readonly #renderer: WebGLRenderer;
  readonly #scene = new Scene();
  readonly #camera = new PerspectiveCamera(30, 1, 0.1, 50);
  readonly #pivot = new Group();
  readonly #ball: Mesh<SphereGeometry, MeshStandardMaterial>;
  readonly #marker = new Group();
  readonly #maps: Record<Destination, Texture>;
  #raf = 0;

  constructor() {
    this.canvas.className = 'holo-globe';
    this.#renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.#renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.#renderer.setSize(SIZE_PX, SIZE_PX, false);
    this.#renderer.outputColorSpace = SRGBColorSpace;
    const loader = new TextureLoader();
    const load = (url: string): Texture => {
      const tex = loader.load(url);
      tex.colorSpace = SRGBColorSpace;
      return tex;
    };
    this.#maps = { mars: load(marsMap), moon: load(moonMap) };
    this.#ball = new Mesh(new SphereGeometry(1, 64, 48), new MeshStandardMaterial({ map: this.#maps.mars, roughness: 1 }));
    const glow = new MeshBasicMaterial({ color: new Color(MARKER_COLOR).multiplyScalar(2), transparent: true, blending: AdditiveBlending, side: DoubleSide });
    const dot = new Mesh(new SphereGeometry(0.035, 16, 12), glow);
    const ring = new Mesh(new RingGeometry(0.07, 0.095, 40), glow);
    this.#marker.add(dot, ring);
    this.#pivot.add(this.#ball, this.#marker);
    this.#scene.add(this.#pivot, new AmbientLight(0xffffff, 0.9));
    const sun = new DirectionalLight(0xffffff, 2.2);
    sun.position.set(2, 1.2, 3);
    this.#scene.add(sun);
    this.#camera.position.set(0, 0, 4.4);
  }

  /** Show a landing site; null hides the marker and lets the globe turn freely. */
  show(world: Destination, site: { lat: number; lon: number } | null): void {
    this.#ball.material.map = this.#maps[world];
    this.#ball.material.needsUpdate = true;
    this.#marker.visible = Boolean(site);
    if (site) {
      const at = onGlobe(site.lat, site.lon, 1.005);
      this.#marker.position.copy(at);
      this.#marker.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), at.clone().normalize());
      // turn the globe so the site faces the viewer (yaw first, then most of the latitude)
      this.#pivot.rotation.set(((site.lat * Math.PI) / 180) * 0.7, Math.atan2(-at.x, at.z), 0);
    }
    if (!this.#raf) this.#loop(performance.now());
  }

  #loop = (last: number): void => {
    this.#raf = requestAnimationFrame((now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      if (this.#marker.visible) {
        this.#marker.scale.setScalar(1 + Math.sin(now / 300) * 0.15);
      } else {
        this.#pivot.rotation.y += dt * SPIN;
      }
      this.#renderer.render(this.#scene, this.#camera);
      this.#loop(now);
    });
  };

  stop(): void {
    cancelAnimationFrame(this.#raf);
    this.#raf = 0;
  }

  dispose(): void {
    this.stop();
    this.#renderer.dispose();
    for (const map of Object.values(this.#maps)) map.dispose();
  }
}

