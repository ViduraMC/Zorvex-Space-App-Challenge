import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  Vector3,
} from 'three';
import type { Object3D } from 'three';
import gsap from 'gsap';
import { part, tube, type MachineParts } from '../../engine/models';
import type { EpisodeContext, SceneBuild, SceneHandles } from '../../engine/types';
import type { Scope } from '../../engine/scope';
import { APOLLO_11, APOLLO_PARTS } from './storyData';
import { go } from '../../engine/router';
import { nasaModel, splitAbove } from '../../journey/nasaModels';

/** NASA's Lunar Module stood about 7 m tall; parts above this share of its height are the ascent stage. */
const LM_HEIGHT = 7;
const DESCENT_SHARE = 0.42;
/** Turns the model so its ladder faces the station (+z). */
const LM_TURN = 0;

function buildEasep(materials: SceneBuild['materials']): MachineParts {
  const root = new Group();
  const body = new Group();
  root.add(body);
  part(body, new BoxGeometry(0.62, 0.15, 0.62), materials.white, 0, 0.22, 0);
  part(body, new CylinderGeometry(0.045, 0.045, 0.92, 8), materials.alu, 0, 0.76, 0);
  part(body, new CylinderGeometry(0.12, 0.12, 0.08, 12), materials.gold, 0, 1.24, 0);
  for (const side of [-1, 1]) {
    const z = side * 0.66;
    tube(body, new Vector3(0, 0.3, side * 0.25), new Vector3(0, 0.3, z), 0.025, materials.alu);
    part(body, new BoxGeometry(0.08, 0.04, 0.72), materials.alu, 0, 0.31, side * 0.98);
    part(body, new BoxGeometry(0.72, 0.045, 0.82), materials.solar, 0, 0.33, side * 1.38);
  }
  return { root, body, bubbleHeight: 1.3 };
}

function buildLander(materials: SceneBuild['materials']): {
  group: Group;
  ascent: Group;
  hatch: Group;
} {
  const group = new Group();
  part(
    group,
    new BoxGeometry(APOLLO_11.lander.widthM, APOLLO_11.lander.thicknessM, APOLLO_11.lander.widthM),
    materials.gold,
    0,
    APOLLO_11.lander.clearanceM + APOLLO_11.lander.thicknessM / 2,
    0,
  );

  const legAnchors = [
    { a: new Vector3(-1.35, 1.55, 0), b: new Vector3(-APOLLO_11.lander.footpadSpanM / 2, 0, 0) },
    { a: new Vector3(1.35, 1.55, 0), b: new Vector3(APOLLO_11.lander.footpadSpanM / 2, 0, 0) },
    { a: new Vector3(0, 1.55, -1.35), b: new Vector3(0, 0, -APOLLO_11.lander.footpadSpanM / 2) },
    { a: new Vector3(0, 1.55, 1.35), b: new Vector3(0, 0, APOLLO_11.lander.footpadSpanM / 2) },
  ];
  for (const { a, b } of legAnchors) {
    tube(group, a, b, 0.09, materials.alu);
    part(group, new CylinderGeometry(0.38, 0.38, 0.08, 12), materials.white, b.x, 0.04, b.z);
  }

  const ascent = new Group();
  part(ascent, new BoxGeometry(4, APOLLO_11.lander.ascentHeightM, APOLLO_11.lander.ascentWidthM), materials.white, 0, 0, 0);
  for (const x of [-0.8, 0.8]) {
    part(ascent, new BoxGeometry(0.58, 0.48, 0.04), materials.dark, x, 0.3, APOLLO_11.lander.ascentWidthM / 2 + 0.025);
  }
  ascent.position.set(0, APOLLO_11.lander.clearanceM + APOLLO_11.lander.thicknessM + APOLLO_11.lander.ascentHeightM / 2, 0);
  group.add(ascent);

  for (const x of [-0.25, 0.25]) {
    tube(group, new Vector3(x, 0.08, 2.2), new Vector3(x, 4.1, 2.2), 0.025, materials.alu);
  }
  for (let y = 0.25; y < 4; y += 0.35) {
    tube(group, new Vector3(-0.25, y, 2.2), new Vector3(0.25, y, 2.2), 0.018, materials.alu);
  }

  const hatch = new Group();
  const hatchPanel = part(hatch, new BoxGeometry(0.75, 0.86, 0.05), materials.gold, 0, 0, 0);
  hatchPanel.position.set(0, 0, 0.04);
  hatch.position.set(0, ascent.position.y - 0.45, APOLLO_11.lander.ascentWidthM / 2);
  ascent.add(hatch);
  group.position.set(APOLLO_11.lander.x, 0, APOLLO_11.lander.z);
  return { group, ascent, hatch };
}

function buildAstronaut(materials: SceneBuild['materials']): Group {
  const person = new Group();
  part(person, new BoxGeometry(0.42, 0.62, 0.28), materials.white, 0, 0.92, 0);
  part(person, new SphereGeometry(0.23, 12, 10), materials.white, 0, 1.43, 0);
  for (const side of [-1, 1]) {
    tube(person, new Vector3(side * 0.18, 1.13, 0), new Vector3(side * 0.34, 0.78, 0.08), 0.075, materials.white);
    tube(person, new Vector3(side * 0.12, 0.65, 0), new Vector3(side * 0.13, 0.12, 0.02), 0.08, materials.white);
  }
  return person;
}

function buildFlag(materials: SceneBuild['materials']): Group {
  const flag = new Group();
  tube(flag, new Vector3(0, 0, 0), new Vector3(0, 1.6, 0), 0.025, materials.alu);
  part(flag, new BoxGeometry(0.65, 0.38, 0.025), materials.white, 0.32, 1.38, 0);
  flag.position.set(-1.8, 0, APOLLO_11.lander.z + 5.2);
  return flag;
}

function buildSurfaceCamera(materials: SceneBuild['materials']): Group {
  const camera = new Group();
  part(camera, new BoxGeometry(0.24, 0.2, 0.18), materials.dark, 0, 0.2, 0);
  tube(camera, new Vector3(0, 0.1, 0), new Vector3(0, 0, 0), 0.025, materials.alu);
  camera.position.set(1.6, 0, APOLLO_11.lander.z + 5.4);
  return camera;
}

function buildSolarWindExperiment(materials: SceneBuild['materials']): Group {
  const experiment = new Group();
  part(experiment, new BoxGeometry(0.18, 0.38, 0.12), materials.alu, 0, 0.26, 0);
  part(experiment, new BoxGeometry(0.48, 0.04, 0.02), materials.gold, 0, 0.48, 0);
  experiment.position.set(0.7, 0, APOLLO_11.lander.z + 6.1);
  return experiment;
}

function buildRetroreflector(materials: SceneBuild['materials']): Group {
  const reflector = new Group();
  part(reflector, new BoxGeometry(0.3, 0.08, 0.3), materials.alu, 0, 0.08, 0);
  for (const x of [-0.08, 0, 0.08]) {
    part(reflector, new BoxGeometry(0.035, 0.02, 0.035), materials.white, x, 0.14, 0);
  }
  reflector.position.set(-1.9, 0, -4.6);
  reflector.visible = false;
  return reflector;
}

function createStoryStamp(ctx: EpisodeContext, scope: Scope, key: string): HTMLDivElement {
  const shell = ctx.canvas.parentElement;
  if (!shell) throw new Error('Apollo story HUD is not mounted.');
  const stamp = scope.el('div', 'apollo-story-stamp', shell, ctx.t(key));
  stamp.setAttribute('aria-live', 'polite');
  return stamp;
}

function showPartCard(ctx: EpisodeContext, scope: Scope, id: string): void {
  const shell = ctx.canvas.parentElement;
  if (!shell) throw new Error('Apollo part card is not mounted.');
  const entry = APOLLO_PARTS.find((partEntry) => partEntry.id === id);
  if (!entry) throw new Error(`Unknown Apollo story part "${id}".`);
  const card = scope.el('section', 'apollo-part-card', shell);
  card.dataset.bubbleAvoid = ''; // the speech bubble moves out of the card's way
  card.setAttribute('aria-label', ctx.t(entry.name));
  scope.el('p', 'apollo-part-card__eyebrow', card, ctx.t('p2.memory'));
  scope.el('h2', 'apollo-part-card__title', card, ctx.t(entry.name));
  scope.el('p', 'apollo-part-card__role', card, ctx.t(entry.role));
  scope.el('p', 'apollo-part-card__facts', card, ctx.t(entry.facts));
  scope.el('p', 'apollo-part-card__contribution', card, ctx.t(entry.contribution));
}

function addShutdownOverlay(ctx: EpisodeContext, scope: Scope): Promise<void> {
  const shell = ctx.canvas.parentElement;
  if (!shell) throw new Error('Apollo shutdown screen is not mounted.');
  const overlay = scope.el('section', 'apollo-shutdown', shell);
  overlay.setAttribute('aria-label', ctx.t('shutdown.aria'));
  overlay.setAttribute('aria-hidden', 'true');
  const terminal = scope.el('pre', 'apollo-shutdown__terminal', overlay);
  terminal.setAttribute('aria-live', 'polite');
  const error = ctx.t('shutdown.error');
  return (async () => {
    await scope.sleep(1500);
    const eyes = createEyes(ctx, scope);
    eyes.classList.add('apollo-eyes--open');
    await scope.sleep(50);
    eyes.classList.remove('apollo-eyes--open');
    ctx.canvas.classList.add('apollo-focus-soft');
    await scope.sleep(motionDuration(APOLLO_11.timing.shutdownCloseMs));
    ctx.canvas.classList.remove('apollo-focus-soft');
    eyes.remove();
    overlay.classList.add('apollo-shutdown--visible');
    overlay.setAttribute('aria-hidden', 'false');
    await scope.sleep(300);
    for (let flicker = 0; flicker < 4; flicker++) {
      overlay.classList.toggle('apollo-shutdown--flicker');
      await scope.sleep(100);
    }
    overlay.classList.remove('apollo-shutdown--flicker');
    await scope.sleep(1500);

    for (const character of error) {
      terminal.textContent += character;
      if (character !== '\n' && character !== ' ') await scope.sleep(40);
    }
    await scope.sleep(APOLLO_11.timing.shutdownErrorHoldMs);

    const epilogue = scope.el('div', 'apollo-shutdown__epilogue', overlay, ctx.t('shutdown.epilogue'));
    epilogue.setAttribute('aria-live', 'polite');
    const replay = scope.el('button', 'btn alt apollo-shutdown__replay', overlay, ctx.t('shutdown.replay'));
    replay.type = 'button';
    scope.listen(replay, 'click', () => go(location.hash));
    await scope.sleep(12000);
  })();
}

function waitForTween(scope: Scope, target: object, vars: gsap.TweenVars): Promise<void> {
  return scope.wait(
    new Promise<void>((resolve) => {
      const tween = gsap.to(target, { ...vars, onComplete: resolve });
      scope.add(() => tween.kill());
    }),
  );
}

function motionDuration(ms: number): number {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms;
}

function createEyes(ctx: EpisodeContext, scope: Scope): HTMLDivElement {
  const shell = ctx.canvas.parentElement;
  if (!shell) throw new Error('Apollo episode canvas is not mounted.');
  const eyes = scope.el('div', 'apollo-eyes apollo-eyes--closed', shell);
  eyes.setAttribute('aria-hidden', 'true');
  scope.el('div', 'apollo-eyes__lid apollo-eyes__lid--top', eyes);
  scope.el('div', 'apollo-eyes__lid apollo-eyes__lid--bottom', eyes);
  return eyes;
}

function makeEarth(): Group {
  const earth = new Group();
  const globe = new Mesh(
    new SphereGeometry(0.8, 20, 12),
    new MeshBasicMaterial({ color: 0x397bbf, fog: false }),
  );
  globe.position.set(0, 9.2, 40);
  earth.add(globe);
  const land = new Mesh(
    new SphereGeometry(0.82, 12, 8),
    new MeshBasicMaterial({ color: 0x6a9c5e, fog: false }),
  );
  land.scale.set(0.46, 0.16, 0.26);
  land.position.set(-0.28, 9.43, 39.84);
  earth.add(land);
  return earth;
}

export default async function buildScene({ scene, materials }: SceneBuild): Promise<SceneHandles> {
  const { group: eagle, ascent, hatch } = buildLander(materials);
  scene.add(eagle);
  // NASA's Lunar Module replaces the box stand-in; its upper half joins the ascent group so liftoff still works
  const lm = await nasaModel('apollo-lunar-module', { size: LM_HEIGHT, by: 'height' });
  if (lm) {
    for (const child of [...eagle.children, ...ascent.children]) if (child !== ascent) child.visible = false;
    lm.rotation.y = LM_TURN;
    eagle.add(lm);
    ascent.attach(splitAbove(lm, DESCENT_SHARE));
  }
  // the Saturn V appears on the horizon as a memory while its card is shown
  const saturn = await nasaModel('saturn-v', { size: 40, by: 'height' });
  if (saturn) {
    saturn.position.set(-55, -2, -80);
    saturn.visible = false;
    scene.add(saturn);
  }
  const showSaturn = (on: boolean): void => {
    if (saturn) saturn.visible = on;
  };

  const astronautA = buildAstronaut(materials);
  const astronautB = buildAstronaut(materials);
  astronautA.position.set(0.6, 0, APOLLO_11.lander.z + 4.6);
  astronautB.position.set(-0.6, 0, APOLLO_11.lander.z + 4.6);
  scene.add(astronautA, astronautB);

  const flag = buildFlag(materials);
  const tvCamera = buildSurfaceCamera(materials);
  const solarWindExperiment = buildSolarWindExperiment(materials);
  const retroreflector = buildRetroreflector(materials);
  scene.add(flag, tvCamera, solarWindExperiment, retroreflector);
  flag.visible = tvCamera.visible = solarWindExperiment.visible = false;

  const memorialPacket = part(
    scene,
    new BoxGeometry(0.18, 0.08, 0.14),
    materials.gold,
    0.8,
    0.05,
    APOLLO_11.lander.z + 4.9,
  );
  memorialPacket.visible = false;
  scene.add(makeEarth());

  const objects: Record<string, Object3D> = {
    eagle,
    ascent,
    hatch,
    astronautA,
    astronautB,
    memorialPacket,
    flag,
    tvCamera,
    solarWindExperiment,
    retroreflector,
  };
  let eyes: HTMLDivElement | null = null;
  let memoryWash: HTMLDivElement | null = null;
  let stamp: HTMLDivElement | null = null;

  const storyStamp = (ctx: EpisodeContext, scope: Scope, key: string): void => {
    if (!stamp) {
      stamp = createStoryStamp(ctx, scope, key);
      const currentStamp = stamp;
      scope.add(() => {
        if (stamp === currentStamp) stamp = null;
      });
    } else {
      stamp.textContent = ctx.t(key);
    }
  };

  const startMemory = (ctx: EpisodeContext, scope: Scope): void => {
    const shell = ctx.canvas.parentElement;
    if (!shell) throw new Error('Apollo memory scene is not mounted.');
    memoryWash = scope.el('div', 'apollo-memory-wash', shell);
    memoryWash.setAttribute('aria-hidden', 'true');
    scope.add(() => {
      if (memoryWash) memoryWash = null;
    });
  };

  const stopMemory = (): void => {
    memoryWash?.remove();
    memoryWash = null;
    stamp?.remove();
    stamp = null;
  };

  const showPart = (ctx: EpisodeContext, scope: Scope, id: string): void => {
    // by now both astronauts are back inside Eagle
    astronautA.visible = astronautB.visible = false;
    showPartCard(ctx, scope, id);
  };

  return {
    machine: buildEasep(materials),
    objects,
    calls: {
      async firstPerson(ctx) {
        ctx.machine.place(0, 0, 0);
        ctx.machine.root.visible = true;
        eagle.visible = true;
        ascent.visible = true;
        await ctx.director.shot({
          pos: APOLLO_11.camera.firstPerson.pos,
          look: APOLLO_11.camera.firstPerson.look,
          ms: motionDuration(1800),
        });
      },
      boot(ctx, scope) {
        eyes = createEyes(ctx, scope);
        ctx.canvas.classList.add('apollo-focus-soft');
        scope.add(() => ctx.canvas.classList.remove('apollo-focus-soft', 'apollo-focus-sharp'));
      },
      async openEyes(ctx, scope) {
        if (!eyes) throw new Error('Apollo eye overlay was not prepared.');
        const overlay = eyes;
        overlay.classList.remove('apollo-eyes--closed');
        overlay.classList.add('apollo-eyes--open');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        ctx.canvas.classList.add('apollo-focus-sharp');
        if (reducedMotion) {
          await scope.sleep(150);
        } else {
          await scope.sleep(APOLLO_11.timing.eyeOpenMs / 2);
          overlay.classList.add('apollo-eyes--blink');
          await scope.sleep(140);
          overlay.classList.remove('apollo-eyes--blink');
          await scope.sleep(APOLLO_11.timing.eyeOpenMs / 2 - 140);
        }
        ctx.canvas.classList.remove('apollo-focus-soft', 'apollo-focus-sharp');
        overlay.remove();
        if (eyes === overlay) eyes = null;
      },
      async aldrinReturns(_ctx, scope) {
        hatch.rotation.z = Math.PI / 2;
        astronautA.visible = true;
        await waitForTween(scope, astronautA.position, {
          x: 0.25,
          y: 4.2,
          z: APOLLO_11.lander.z + 2.2,
          duration: motionDuration(APOLLO_11.timing.astronautClimbMs) / 1000,
          ease: 'sine.inOut',
        });
        astronautA.visible = false;
      },
      async armstrongReturns(_ctx, scope) {
        astronautB.visible = true;
        await waitForTween(scope, astronautB.position, {
          x: -0.25,
          y: 2.4,
          z: APOLLO_11.lander.z + 3.8,
          duration: motionDuration(APOLLO_11.timing.astronautClimbMs) / 1000,
          ease: 'sine.inOut',
        });
        memorialPacket.visible = true;
        await waitForTween(scope, astronautB.position, {
          x: -0.25,
          y: 4.2,
          z: APOLLO_11.lander.z + 2.2,
          duration: motionDuration(APOLLO_11.timing.astronautClimbMs) / 1000,
          ease: 'sine.inOut',
        });
        astronautB.visible = false;
        memorialPacket.visible = true;
      },
      async turnAway(ctx) {
        await ctx.director.shot({
          pos: APOLLO_11.camera.earthLook.pos,
          look: APOLLO_11.camera.earthLook.look,
          ms: motionDuration(APOLLO_11.timing.turnMs),
        });
      },
      async faceEagle(ctx, scope) {
        await ctx.director.shot({
          pos: APOLLO_11.camera.firstPerson.pos,
          look: APOLLO_11.camera.firstPerson.look,
          ms: motionDuration(1800),
        });
        await waitForTween(scope, hatch.rotation, {
          z: -Math.PI / 2,
          duration: motionDuration(800) / 1000,
          ease: 'sine.inOut',
        });
      },
      async originMemory(ctx, scope) {
        const shell = ctx.canvas.parentElement;
        if (!shell) throw new Error('Apollo episode canvas is not mounted.');
        const fade = scope.el('div', 'apollo-memory-fade', shell);
        await waitForTween(scope, fade, { opacity: 1, duration: motionDuration(500) / 1000 });
        await ctx.director.shot({
          pos: APOLLO_11.camera.origin.pos,
          look: APOLLO_11.camera.origin.look,
          ms: motionDuration(1200),
        });
        await waitForTween(scope, fade, { opacity: 0, duration: motionDuration(500) / 1000 });
        fade.remove();
      },
      beginMemory(ctx, scope) {
        startMemory(ctx, scope);
      },
      async memoryDescent(ctx, scope) {
        storyStamp(ctx, scope, 'memory.poweredDescent');
        const origin = ctx.camera.position.x;
        await waitForTween(scope, ctx.camera.position, {
          x: origin + 0.08,
          duration: motionDuration(900) / 1000,
          yoyo: true,
          repeat: 2,
          ease: 'sine.inOut',
        });
        await scope.sleep(APOLLO_11.timing.memoryBeatMs);
      },
      async memoryTouchdown(ctx, scope) {
        storyStamp(ctx, scope, 'memory.touchdown');
        await waitForTween(scope, eagle.position, {
          y: 0.08,
          duration: motionDuration(250) / 1000,
          yoyo: true,
          repeat: 1,
          ease: 'sine.out',
        });
      },
      async memoryFirstSteps(ctx, scope) {
        storyStamp(ctx, scope, 'memory.firstSteps');
        astronautA.visible = true;
        astronautB.visible = true;
        astronautA.position.set(0.55, 0, APOLLO_11.lander.z + 3.8);
        astronautB.position.set(-0.55, 0, APOLLO_11.lander.z + 4.4);
        await waitForTween(scope, astronautA.position, {
          z: APOLLO_11.lander.z + 2.4,
          duration: motionDuration(900) / 1000,
          ease: 'sine.inOut',
        });
        astronautB.visible = false;
      },
      async prepareDeployment(ctx, scope) {
        storyStamp(ctx, scope, 'memory.unload');
        memorialPacket.visible = false;
        flag.visible = tvCamera.visible = solarWindExperiment.visible = false;
        retroreflector.visible = false;
        ctx.machine.place(0, APOLLO_11.lander.z + 1.1, 0);
        ctx.machine.root.visible = true;
        await ctx.director.shot({
          pos: APOLLO_11.camera.deployment.pos,
          look: APOLLO_11.camera.deployment.look,
          ms: motionDuration(900),
        });
      },
      async memorySurfaceWork(ctx, scope) {
        storyStamp(ctx, scope, 'memory.surfaceWork');
        flag.visible = true;
        await scope.sleep(motionDuration(APOLLO_11.timing.memoryBeatMs));
        tvCamera.visible = true;
        await scope.sleep(motionDuration(APOLLO_11.timing.memoryBeatMs));
        solarWindExperiment.visible = true;
        retroreflector.visible = true;
      },
      async returnToPresent(ctx, scope) {
        stopMemory();
        astronautA.visible = astronautB.visible = false;
        ctx.machine.place(0, 0, 0);
        ctx.machine.root.visible = true;
        await ctx.director.shot({
          pos: APOLLO_11.camera.firstPerson.pos,
          look: APOLLO_11.camera.firstPerson.look,
          ms: motionDuration(1000),
        });
        storyStamp(ctx, scope, 'memory.present');
      },
      async partSaturn(ctx, scope) {
        showPart(ctx, scope, 'saturn');
        showSaturn(true);
        scope.add(() => showSaturn(false));
        await ctx.director.shot({ pos: [2, 1.2, 3], look: [-45, 16, -80], ms: motionDuration(2200) });
      },
      partColumbia(ctx, scope) {
        showPart(ctx, scope, 'columbia');
      },
      partAscent(ctx, scope) {
        showPart(ctx, scope, 'ascent');
      },
      partDescent(ctx, scope) {
        showPart(ctx, scope, 'descent');
      },
      partSurface(ctx, scope) {
        showPart(ctx, scope, 'surface');
      },
      partEasep(ctx, scope) {
        showPart(ctx, scope, 'easep');
      },
      async partClosing(ctx) {
        await ctx.director.shot({
          pos: [0, 7, 9],
          look: [0, 1, APOLLO_11.lander.z / 2],
          ms: motionDuration(1200),
        });
      },
      async liftoff(_ctx, scope) {
        astronautA.visible = astronautB.visible = false;
        await waitForTween(scope, ascent.position, {
          y: ascent.position.y + 5,
          duration: motionDuration(1800) / 1000,
          ease: 'sine.in',
        });
        ascent.visible = false;
        flag.rotation.z = Math.PI / 2;
      },
      async lookToEarth(ctx) {
        await ctx.director.shot({
          pos: APOLLO_11.camera.earthLook.pos,
          look: APOLLO_11.camera.earthLook.look,
          ms: motionDuration(1200),
        });
      },
      async aloneDays(ctx, scope) {
        const shell = ctx.canvas.parentElement;
        if (!shell) throw new Error('Apollo episode canvas is not mounted.');
        const sky = scope.el('div', 'apollo-time-lapse', shell);
        sky.setAttribute('aria-hidden', 'true');
        await waitForTween(scope, sky, { opacity: 0.32, duration: motionDuration(2500) / 1000 });
      },
      async lettersHome(ctx, scope) {
        const shell = ctx.canvas.parentElement;
        if (!shell) throw new Error('Apollo episode canvas is not mounted.');
        const signal = scope.el('div', 'apollo-signal-pulse', shell, ctx.t('p4.signal'));
        signal.setAttribute('aria-live', 'polite');
        await scope.sleep(motionDuration(1600));
      },
      async firstNight(ctx, scope) {
        const shell = ctx.canvas.parentElement;
        if (!shell) throw new Error('Apollo episode canvas is not mounted.');
        const dark = scope.el('div', 'apollo-night-fade', shell);
        await waitForTween(scope, dark, { opacity: 0.96, duration: motionDuration(1400) / 1000 });
        await scope.sleep(motionDuration(1200));
        await waitForTween(scope, dark, { opacity: 0.12, duration: motionDuration(1400) / 1000 });
        dark.remove();
      },
      async lastDay(ctx, scope) {
        storyStamp(ctx, scope, 'p4.lastDayStamp');
        await scope.sleep(motionDuration(700));
      },
      async goodnight(ctx) {
        await ctx.director.shot({
          pos: APOLLO_11.camera.firstPerson.pos,
          look: APOLLO_11.camera.firstPerson.look,
          ms: motionDuration(1000),
        });
        await ctx.director.shot({
          pos: APOLLO_11.camera.earthLook.pos,
          look: APOLLO_11.camera.earthLook.look,
          ms: motionDuration(1600),
        });
      },
      async shutdown(ctx, scope) {
        stopMemory();
        await addShutdownOverlay(ctx, scope);
      },
    },
  };
}
