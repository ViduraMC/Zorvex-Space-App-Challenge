/**
 * Renderer + post-processing with two quality presets.
 *   high: bloom, film grain, vignette, ACES tone mapping, SMAA, soft 2048 shadows
 *   low:  vignette, ACES tone mapping, SMAA, 1024 shadows, capped pixel ratio
 * Follows pmndrs/postprocessing's setup: the renderer itself does no tone mapping and
 * ToneMappingEffect runs last in the image chain.
 */
import { HalfFloatType, NoToneMapping, PCFShadowMap, SRGBColorSpace, WebGLRenderer } from 'three';
import type { Camera, Scene } from 'three';
import {
  BlendFunction,
  BloomEffect,
  EffectComposer,
  EffectPass,
  NoiseEffect,
  RenderPass,
  SMAAEffect,
  SMAAPreset,
  ToneMappingEffect,
  ToneMappingMode,
  VignetteEffect,
} from 'postprocessing';
import { CONFIG } from '../config';
import type { Quality } from './progress';

export class Renderer {
  readonly gl: WebGLRenderer;
  readonly composer: EffectComposer;
  quality: Quality;
  #scene: Scene | null = null;
  #camera: Camera | null = null;

  /** Throws when WebGL is unavailable; the player shows a friendly message instead. */
  constructor(canvas: HTMLCanvasElement, quality: Quality) {
    this.quality = quality;
    this.gl = new WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.gl.outputColorSpace = SRGBColorSpace;
    this.gl.toneMapping = NoToneMapping;
    this.gl.shadowMap.enabled = true;
    this.gl.shadowMap.type = PCFShadowMap;
    this.composer = new EffectComposer(this.gl, { frameBufferType: HalfFloatType });
  }

  setScene(scene: Scene, camera: Camera): void {
    this.#scene = scene;
    this.#camera = camera;
    this.#buildPasses();
    this.resize();
  }

  setQuality(quality: Quality): void {
    this.quality = quality;
    this.#buildPasses();
    this.resize();
  }

  #buildPasses(): void {
    if (!this.#scene || !this.#camera) return;
    const camera = this.#camera;
    this.composer.removeAllPasses();
    this.composer.addPass(new RenderPass(this.#scene, camera));
    const vignette = new VignetteEffect({ offset: 0.32, darkness: 0.58 });
    const toneMapping = new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC });
    if (this.quality === 'high') {
      const bloom = new BloomEffect({ mipmapBlur: true, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, intensity: 0.7 });
      const grain = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY, premultiply: false });
      grain.blendMode.opacity.value = 0.14;
      this.composer.addPass(new EffectPass(camera, bloom, vignette, grain, toneMapping));
      this.composer.addPass(new EffectPass(camera, new SMAAEffect({ preset: SMAAPreset.HIGH })));
    } else {
      this.composer.addPass(new EffectPass(camera, vignette, toneMapping));
      this.composer.addPass(new EffectPass(camera, new SMAAEffect({ preset: SMAAPreset.LOW })));
    }
  }

  resize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, CONFIG.maxPixelRatio[this.quality]));
    this.composer.setSize(w, h);
  }

  render(dt: number): void {
    this.composer.render(dt);
  }

  dispose(): void {
    this.composer.dispose();
    this.gl.dispose();
  }
}
