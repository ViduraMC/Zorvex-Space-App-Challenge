/**
 * The episode script format. An episode is DATA: pages of steps. Text is always an i18n key
 * from the episode's i18n/<lang>.json. Teammates build whole episodes with these types and
 * never need to edit src/engine/.
 */
import type { Object3D, PerspectiveCamera, Scene, Vector3 } from 'three';
import type { AudioEngine, SoundName } from './audio';
import type { Comic } from './comic/comic';
import type { Director } from './director';
import type { Fx, FxName } from './fx';
import type { Machine, MachineMaterials, MachineParts } from './models';
import type { GameConfigs } from './play';
import type { Quality } from './progress';
import type { Scope } from './scope';
import type { Sky, SkyPreset, SkyState } from './sky';
import type { HeightGrid, World, WorldKind } from './worlds';

export type Vec3 = readonly [number, number, number];
/** A place in the world: the name of a scene object ("machine" always exists) or a position. */
export type Target = string | Vec3;

/** One verified fact. Every line a machine speaks points at one of these. */
export interface Fact {
  id: string;
  /** The fact in plain English, as checked against the source. */
  text: string;
  /** URL of the page the fact was checked on (NASA first). "TODO-VERIFY" blocks release. */
  source: string;
  sourceName: string;
}

export interface Shot {
  pos: Vec3;
  look: Vec3;
  /** Travel time; 0 or omitted = hard cut. */
  ms?: number;
  /** Make pos and look offsets from this object's position (for example "machine"). */
  rel?: string;
  /** Keep the named object centred while it moves; false stops following. */
  follow?: string | false;
}

type PlayStep = { [K in keyof GameConfigs]: { play: K; config: GameConfigs[K] } }[keyof GameConfigs];

export type Step =
  /** Yellow narrator box. Waits for Next unless `auto` (ms) is set. */
  | { caption: string; fact?: string; auto?: number }
  /** Speech bubble. `fact` is required: a fact id, or null for pure feeling ("Goodbye!"). `by` names another speaker (a role in voice/cast.json). */
  | { say: string; fact: string | null; auto?: number; by?: string }
  /** Comic sound-effect word ("WHIRRR!") with an optional sound. */
  | { sfx: string; sound?: SoundName }
  /** A sound on its own. */
  | { sound: SoundName }
  /** Camera. By default the story continues while the camera moves; `block` waits for it. */
  | { shot: Shot; block?: boolean }
  | { sky: SkyPreset | SkyState; ms?: number; block?: boolean }
  | { fx: FxName; at: Target }
  | { wait: number }
  /** Big action button the child must press ("Roll down the ramp!"). */
  | { act: string }
  /** Tappable choices; each may answer with a line from the machine. */
  | { choice: { label: string; say?: string; fact?: string | null }[] }
  /** Run a function from the episode's scene.ts (`calls`). Waits for it unless `block: false`. */
  | { call: string; block?: boolean }
  /** Switch to another world of this episode (see EpisodeDef.stages), optionally with a sky preset. */
  | { stage: WorldKind; sky?: SkyPreset }
  /** Put the machine somewhere at once. Start a page with it: the child may have skipped the page before. */
  | { place: { x: number; z: number; heading?: number } }
  /** Machine power 0..1 (eye glow), faded over ms. */
  | { power: number; ms?: number }
  /** A reusable mini-game from engine/play, or "custom:<file>" from the episode's games/ folder. */
  | PlayStep
  | { play: `custom:${string}`; config?: unknown }
  /** Award the mission patch (normally the last step). */
  | { patch: true };

export interface EpisodeDef {
  /** Must equal the folder name. */
  id: string;
  /** Position in the hub; lower comes first. */
  order: number;
  world: WorldKind;
  /** Extra worlds the story visits (for example a launch on Earth, a cruise through space). */
  stages?: WorldKind[];
  /** Explorer ids (src/data/explorers.*.json) whose Explore button opens this episode. */
  covers?: string[];
  /** Sky at the start of the episode. */
  sky: SkyPreset;
  machine: {
    /** Optimised GLB in assets/. Without it (or without a scene.ts machine) a stand-in probe is used. */
    model?: string;
    scale?: number;
    start?: { x: number; z: number; heading?: number };
  };
  /** The collectible badge: a colour and a short glyph (emoji or 1-2 letters). No NASA insignia. */
  patch: { color: string; glyph: string };
  /** Day the machine was last heard from; the hub shows how long it has been waiting. */
  lastContact?: { date: string; fact: string };
  /** Real numbers for the end card ("83" + "days worked"). */
  stats?: { value: string; label: string }[];
  /** Which body "Look up tonight" points the child to. */
  lookUp?: 'Mars' | 'Moon';
  /** Mars only: real terrain grid, see scripts/prep-terrain.ts. */
  site?: () => Promise<HeightGrid>;
  /** Keep boulders out of the play area. */
  clear?: { x0: number; x1: number; z0: number; z1: number };
  /** Look of the storytelling layer (styles/themes.css). Default: comic. */
  style?: 'comic' | 'cinematic';
  /** Custom 3D objects and actions; see src/episodes/sojourner/scene.ts. */
  scene?: (build: SceneBuild) => SceneHandles | Promise<SceneHandles>;
  pages: Step[][];
}

/** What scene.ts receives to build its objects. */
export interface SceneBuild {
  scene: Scene;
  world: World;
  /** The scene and world of another stage, to build objects there. */
  stage: (kind: WorldKind) => { scene: Scene; world: World };
  materials: MachineMaterials;
  quality: Quality;
  anisotropy: number;
}

export interface SceneHandles {
  /** The episode's own machine; omit to use the GLB or the stand-in. */
  machine?: MachineParts;
  /** Named objects that steps and mini-games can target. */
  objects?: Record<string, Object3D>;
  /** Named actions for `{ call: 'name' }` steps. */
  calls?: Record<string, (ctx: EpisodeContext, scope: Scope) => void | Promise<void>>;
  /** Runs once when everything exists (wrap machine.groundAt, keep the context, ...). */
  onReady?: (ctx: EpisodeContext) => void;
  update?: (dt: number, time: number) => void;
}

/** Everything a step, a scene action or a mini-game can use. */
export interface EpisodeContext {
  episode: EpisodeDef;
  scene: Scene;
  camera: PerspectiveCamera;
  /** The 3D canvas; mini-games listen here for taps on the scene. */
  canvas: HTMLCanvasElement;
  world: World;
  sky: Sky;
  director: Director;
  comic: Comic;
  audio: AudioEngine;
  fx: Fx;
  machine: Machine;
  objects: Record<string, Object3D>;
  /** The world currently on screen. */
  stageKind: WorldKind;
  /** Show another stage; scene, world, sky and fx above switch with it. */
  setStage: (kind: WorldKind) => void;
  quality: Quality;
  /** Translate a key of this episode (or shared UI text). */
  t: (key: string, vars?: Record<string, string | number>) => string;
  fact: (id: string) => Fact | undefined;
  /** World position of a Target. */
  resolve: (target: Target, out?: Vector3) => Vector3;
  /** Screen position (CSS px) of a world point; `visible` is false behind the camera. */
  project: (point: Vector3) => { x: number; y: number; visible: boolean };
  /** Make the machine speak a line (bubble + voice) and wait for Next. */
  say: (key: string, scope: Scope, role?: string) => Promise<void>;
  /** Show a role's name in the speech bubble (voice/cast.json roles; default the machine). */
  speaker: (role?: string) => void;
}

/** Identity helper that gives episode files full type checking and autocomplete. */
export const defineEpisode = (episode: EpisodeDef): EpisodeDef => episode;
