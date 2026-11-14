/**
 * Sky dome, stars, sun and fill lights, driven by three numbers (day, sunset, sun azimuth).
 * Presets cover the looks in the brief: Mars butterscotch day, Mars BLUE dusk (real: fine dust
 * scatters blue light forward, so the glow around the setting Sun is blue), night, and the
 * black, hard-lit sky of the Moon and deep space.
 */
import {
  BackSide,
  BufferGeometry,
  Color,
  DirectionalLight,
  Float32BufferAttribute,
  FogExp2,
  Group,
  HemisphereLight,
  Mesh,
  PMREMGenerator,
  Points,
  PointsMaterial,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from 'three';
import type { Camera, Texture, WebGLRenderer } from 'three';
import gsap from 'gsap';
import { CONFIG } from '../config';
import { clamp, hash, lerp } from './noise';
import type { Quality } from './progress';

export interface SkyState {
  /** 1 = full day, 0 = night. */
  day: number;
  /** Strength of the sunset glow, 0..1. */
  sunset: number;
  /** Compass direction of the Sun in radians (world XZ plane). */
  az: number;
}

/** The light numbers below were tuned in three.js's old light units; modern units are PI times smaller. */
const LIGHT_SCALE = Math.PI;
const AZ_DAY = 0.95;
const AZ_SET = -0.936; // the Sun goes down behind the Twin Peaks side of the Pathfinder scene

export const SKY_PRESETS = {
  marsDay: { day: 1, sunset: 0, az: AZ_DAY },
  marsAfternoon: { day: 0.86, sunset: 0.25, az: AZ_DAY },
  marsDusk: { day: 0.1, sunset: 1, az: AZ_SET },
  marsNight: { day: 0, sunset: 0.12, az: AZ_SET },
  moonDay: { day: 1, sunset: 0, az: AZ_DAY },
  space: { day: 1, sunset: 0, az: AZ_DAY },
  earthDay: { day: 0.9, sunset: 0.15, az: AZ_DAY },
  earthDusk: { day: 0.25, sunset: 1, az: AZ_SET },
} satisfies Record<string, SkyState>;
export type SkyPreset = keyof typeof SKY_PRESETS;

export type SkyKind = 'mars' | 'moon' | 'space' | 'earth';

const hex = (h: number): Color => new Color(h);
const PALETTE = {
  mars: {
    dayZenith: hex(0xa67c58),
    dayHorizon: hex(0xe8c59c),
    nightZenith: hex(0x03040a),
    nightHorizon: hex(0x16121a),
    setZenith: hex(0x2c2937),
    setHorizon: hex(0x75605e),
    sunDay: hex(0xffe6c8),
    sunSet: hex(0xa9c8ff),
    groundDay: hex(0x7a4a30),
    glow: hex(0x8fbcf5),
    fog: 0.0105,
    sunPower: 2.5,
    fill: 0.55,
  },
  // Blue sky, orange sunset, light haze over the sea.
  earth: {
    dayZenith: hex(0x2f6fb5),
    dayHorizon: hex(0xbcd6ec),
    nightZenith: hex(0x03050c),
    nightHorizon: hex(0x0c1424),
    setZenith: hex(0x3a3d6c),
    setHorizon: hex(0xe8945a),
    sunDay: hex(0xfff4e0),
    sunSet: hex(0xffa060),
    groundDay: hex(0x5a5a40),
    glow: hex(0xffb070),
    fog: 0.0022,
    sunPower: 2.6,
    fill: 0.6,
  },
  // No air: the sky stays black in full daylight and nothing softens the shadows.
  airless: {
    dayZenith: hex(0x000000),
    dayHorizon: hex(0x000000),
    nightZenith: hex(0x000000),
    nightHorizon: hex(0x000000),
    setZenith: hex(0x000000),
    setHorizon: hex(0x000000),
    sunDay: hex(0xffffff),
    sunSet: hex(0xffffff),
    groundDay: hex(0x3a3a3a),
    glow: hex(0xffffff),
    fog: 0,
    sunPower: 1.5,
    fill: 0.05,
  },
};

const SKY_VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const SKY_FRAG = /* glsl */ `
uniform vec3 zenith; uniform vec3 horizon; uniform vec3 glow; uniform vec3 sunDir;
uniform float glowAmt; uniform float disc;
varying vec3 vDir;
void main() {
  vec3 d = normalize(vDir);
  float h = clamp(d.y * 1.15 + 0.02, 0.0, 1.0);
  vec3 col = mix(horizon, zenith, pow(h, 0.5));
  float s = max(dot(d, sunDir), 0.0);
  col += glow * glowAmt * (pow(s, 7.0) * 0.55 + pow(s, 60.0) * 1.3);
  col += vec3(1.0, 0.95, 0.85) * disc * pow(s, 2500.0) * 40.0;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export class Sky {
  readonly state: SkyState;
  readonly sunDir = new Vector3(0, 1, 0);
  /** Where the sun's shadow box is centred; the player keeps it on the machine. */
  readonly focus = new Vector3();
  readonly sun = new DirectionalLight(0xffffff, 2);
  readonly #scene: Scene;
  readonly #kind: SkyKind;
  readonly #pal: (typeof PALETTE)['mars'];
  readonly #group = new Group();
  readonly #mat: ShaderMaterial;
  readonly #stars: PointsMaterial;
  readonly #hemi = new HemisphereLight(0xffffff, 0x000000, 0.5);
  readonly #night = new DirectionalLight(0x7f96c8, 0);
  readonly #envs: Record<'day' | 'dusk' | 'night', Texture>;
  #envNow = '';
  readonly #zenith = new Color();
  readonly #horizon = new Color();

  constructor(scene: Scene, renderer: WebGLRenderer, kind: SkyKind, quality: Quality, start: SkyState) {
    this.#scene = scene;
    this.#kind = kind;
    this.#pal = kind === 'mars' ? PALETTE.mars : kind === 'earth' ? PALETTE.earth : PALETTE.airless;
    this.state = { ...start };
    if (this.#pal.fog > 0) scene.fog = new FogExp2(0xffffff, this.#pal.fog);

    this.#mat = new ShaderMaterial({
      uniforms: {
        zenith: { value: new Color() },
        horizon: { value: new Color() },
        glow: { value: this.#pal.glow },
        sunDir: { value: this.sunDir },
        glowAmt: { value: 0 },
        disc: { value: 1 },
      },
      vertexShader: SKY_VERT,
      fragmentShader: SKY_FRAG,
      side: BackSide,
      depthWrite: false,
      fog: false,
    });
    this.#group.add(new Mesh(new SphereGeometry(1500, 32, 16), this.#mat));

    const starPos: number[] = [];
    const hasAir = kind === 'mars' || kind === 'earth';
    const starCount = hasAir ? 1400 : 2600;
    // airless worlds see stars all around, Mars only above the horizon
    const minElevation = kind === 'space' ? -1 : 0.02;
    for (let i = 0; i < starCount; i++) {
      const az = hash(i, 3) * Math.PI * 2;
      const el = Math.asin(lerp(minElevation, 1, hash(i, 7)));
      starPos.push(Math.cos(el) * Math.cos(az) * 1400, Math.sin(el) * 1400, Math.cos(el) * Math.sin(az) * 1400);
    }
    const starGeo = new BufferGeometry();
    starGeo.setAttribute('position', new Float32BufferAttribute(starPos, 3));
    this.#stars = new PointsMaterial({
      color: 0xffffff,
      size: 1.7,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0,
      fog: false,
      depthWrite: false,
    });
    this.#group.add(new Points(starGeo, this.#stars));
    scene.add(this.#group);

    const size = CONFIG.shadowMapSize[quality];
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(size, size);
    const cam = this.sun.shadow.camera;
    cam.left = cam.bottom = -9;
    cam.right = cam.top = 9;
    cam.near = 1;
    cam.far = 90;
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.02;
    this.#night.position.set(-6, 14, 8);
    scene.add(this.sun, this.sun.target, this.#hemi, this.#night);

    this.#envs = this.#bakeEnvironments(renderer);
    this.#apply();
  }

  /** Reflection maps for the metal and foil, baked once from the sky at three times of day. */
  #bakeEnvironments(renderer: WebGLRenderer): Record<'day' | 'dusk' | 'night', Texture> {
    const pmrem = new PMREMGenerator(renderer);
    const envScene = new Scene();
    envScene.add(new Mesh(new SphereGeometry(50, 24, 12), this.#mat));
    const keep = { ...this.state };
    const bake = (day: number, sunset: number): Texture => {
      this.state.day = day;
      this.state.sunset = sunset;
      this.#apply();
      return pmrem.fromScene(envScene, 0.03).texture;
    };
    const envs = { day: bake(1, 0), dusk: bake(0.12, 1), night: bake(0, 0) };
    Object.assign(this.state, keep);
    pmrem.dispose();
    return envs;
  }

  /** Move to a preset (or exact state) over `ms`; resolves when the change is complete. */
  set(target: SkyPreset | SkyState, ms = 0): Promise<void> {
    const to = typeof target === 'string' ? SKY_PRESETS[target] : target;
    gsap.killTweensOf(this.state);
    if (ms <= 0) {
      Object.assign(this.state, to);
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      gsap.to(this.state, { ...to, duration: ms / 1000, ease: 'sine.inOut', onComplete: resolve });
    });
  }

  #apply(): void {
    const { day, sunset, az } = this.state;
    const p = this.#pal;
    const duskMix = sunset * (1 - day * 0.7);
    this.#zenith.copy(p.nightZenith).lerp(p.dayZenith, day).lerp(p.setZenith, duskMix);
    this.#horizon.copy(p.nightHorizon).lerp(p.dayHorizon, day).lerp(p.setHorizon, duskMix);
    const u = this.#mat.uniforms;
    (u.zenith.value as Color).copy(this.#zenith);
    (u.horizon.value as Color).copy(this.#horizon);
    if (this.#scene.fog) this.#scene.fog.color.copy(this.#horizon);

    const elevation = lerp(0.045, 0.86, day);
    this.sunDir.set(Math.cos(elevation) * Math.cos(az), Math.sin(elevation), Math.cos(elevation) * Math.sin(az));
    const hasAir = this.#kind === 'mars' || this.#kind === 'earth';
    u.glowAmt.value = hasAir ? sunset : 0;
    u.disc.value = clamp(day * 3 + sunset, 0, 1);

    this.sun.target.position.copy(this.focus);
    this.sun.position.copy(this.focus).addScaledVector(this.sunDir, 45);
    this.sun.color.copy(p.sunDay).lerp(p.sunSet, sunset * (1 - day));
    this.sun.intensity = (p.sunPower * day + 0.7 * sunset * (1 - day)) * LIGHT_SCALE;
    this.#hemi.color.copy(this.#zenith).lerp(this.#horizon, 0.5);
    this.#hemi.groundColor.setScalar(0).lerp(p.groundDay, day);
    this.#hemi.intensity = (hasAir ? 0.1 + p.fill * day + 0.25 * sunset : p.fill + 0.1 * day) * LIGHT_SCALE;

    const dark = clamp(1 - day * 2.2 - sunset * 0.55, 0, 1);
    this.#night.intensity = 0.5 * dark * LIGHT_SCALE;
    this.#stars.opacity = hasAir ? dark : 1;
  }

  update(camera: Camera): void {
    this.#apply();
    const { day, sunset } = this.state;
    const want = sunset > 0.5 && day < 0.5 ? 'dusk' : day > 0.35 ? 'day' : 'night';
    if (want !== this.#envNow) {
      this.#scene.environment = this.#envs[want];
      this.#envNow = want;
    }
    this.#group.position.copy(camera.position);
  }
}
