/** Particle presets (three.quarks). Every preset has a lighter version for the low graphics setting. */
import { AdditiveBlending, CanvasTexture, MeshBasicMaterial, NormalBlending } from 'three';
import type { Blending, Object3D, Scene, Vector3 } from 'three';
import {
  BatchedRenderer,
  Bezier,
  ColorOverLife,
  ConeEmitter,
  ConstantColor,
  ConstantValue,
  Gradient,
  IntervalValue,
  ParticleSystem,
  PiecewiseBezier,
  RenderMode,
  SizeOverLife,
  Vector3 as QVector3,
  Vector4 as QVector4,
} from 'three.quarks';
import type { Quality } from './progress';

interface Preset {
  count: number;
  life: [number, number];
  speed: [number, number];
  size: [number, number];
  /** RGBA, 0..1. */
  color: [number, number, number, number];
  /** Cone half-angle in radians: small = a jet, large = a wide puff. */
  spread: number;
  radius: number;
  additive?: boolean;
}

const PRESETS = {
  /** Small kick of dust: a wheel bump, a sensor touching a rock. */
  dustPuff: { count: 14, life: [0.7, 1.5], speed: [0.15, 0.7], size: [0.1, 0.32], color: [0.83, 0.62, 0.42, 0.5], spread: 1.1, radius: 0.12 },
  /** Big impact cloud: an airbag bounce, a landing. */
  dustBurst: { count: 46, life: [1.2, 2.6], speed: [0.6, 2.6], size: [0.5, 1.5], color: [0.83, 0.62, 0.42, 0.55], spread: 1.25, radius: 0.9 },
  /** Grey lunar dust flies in clean arcs (no air to hold it up). */
  moonDust: { count: 24, life: [0.8, 1.6], speed: [0.8, 2.4], size: [0.08, 0.22], color: [0.72, 0.71, 0.69, 0.6], spread: 0.9, radius: 0.15 },
  /** Rocket exhaust smoke: big, slow, long-lived. */
  smoke: { count: 26, life: [3, 5.5], speed: [0.8, 3.2], size: [6, 14], color: [0.78, 0.77, 0.74, 0.62], spread: 1.35, radius: 2.4 },
  /** Bright sparks for a finished scan, a found clue, a win. */
  sparkle: { count: 26, life: [0.4, 0.9], speed: [0.5, 1.6], size: [0.03, 0.09], color: [1, 0.86, 0.35, 1], spread: 1.5, radius: 0.08, additive: true },
} satisfies Record<string, Preset>;

export type FxName = keyof typeof PRESETS;

function softDot(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const g = canvas.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.5, 'rgba(255,255,255,.45)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new CanvasTexture(canvas);
}

export class Fx {
  readonly #scene: Scene;
  readonly #batch = new BatchedRenderer();
  readonly #quality: Quality;
  readonly #materials: Record<'normal' | 'additive', MeshBasicMaterial>;
  readonly #fade = new ColorOverLife(
    new Gradient(
      [
        [new QVector3(1, 1, 1), 0],
        [new QVector3(1, 1, 1), 1],
      ],
      [
        [1, 0],
        [0, 1],
      ],
    ),
  );
  readonly #grow = new SizeOverLife(new PiecewiseBezier([[new Bezier(0.5, 1, 1.5, 1.9), 0]]));

  constructor(scene: Scene, quality: Quality) {
    this.#scene = scene;
    this.#quality = quality;
    const map = softDot();
    const make = (blending: Blending): MeshBasicMaterial =>
      new MeshBasicMaterial({ map, transparent: true, depthWrite: false, blending });
    this.#materials = { normal: make(NormalBlending), additive: make(AdditiveBlending) };
    scene.add(this.#batch);
  }

  #system(p: Preset, looping: boolean): ParticleSystem {
    const count = this.#quality === 'low' ? Math.ceil(p.count / 2) : p.count;
    const system = new ParticleSystem({
      duration: 1,
      looping,
      autoDestroy: !looping,
      worldSpace: true,
      startLife: new IntervalValue(p.life[0], p.life[1]),
      startSpeed: new IntervalValue(p.speed[0], p.speed[1]),
      startSize: new IntervalValue(p.size[0], p.size[1]),
      startColor: new ConstantColor(new QVector4(...p.color)),
      emissionOverTime: new ConstantValue(0),
      emissionOverDistance: new ConstantValue(looping ? count : 0),
      emissionBursts: looping ? [] : [{ time: 0, count: new ConstantValue(count), cycle: 1, interval: 0.01, probability: 1 }],
      shape: new ConeEmitter({ radius: p.radius, angle: p.spread, thickness: 1, arc: Math.PI * 2 }),
      material: this.#materials[p.additive ? 'additive' : 'normal'],
      renderMode: RenderMode.BillBoard,
      renderOrder: 2,
      behaviors: [this.#grow, this.#fade],
    });
    system.emitter.rotation.x = -Math.PI / 2; // the cone opens along +z; point it up
    this.#batch.addSystem(system);
    return system;
  }

  /** One-shot effect at a world position. */
  burst(name: FxName, at: Vector3): void {
    const system = this.#system(PRESETS[name], false);
    system.emitter.position.copy(at);
    this.#scene.add(system.emitter);
  }

  /** Dust that appears only while `carrier` moves (wheels, skids). Returns a stop function. */
  trail(carrier: Object3D, name: FxName, perMetre: number): () => void {
    const system = this.#system({ ...PRESETS[name], count: perMetre }, true);
    system.emitter.position.set(-0.2, 0.03, 0);
    carrier.add(system.emitter);
    return () => {
      system.endEmit();
      carrier.remove(system.emitter);
      this.#batch.deleteSystem(system);
    };
  }

  update(dt: number): void {
    this.#batch.update(dt);
  }

  dispose(): void {
    this.#scene.remove(this.#batch);
    this.#materials.normal.map?.dispose();
    this.#materials.normal.dispose();
    this.#materials.additive.dispose();
  }
}
