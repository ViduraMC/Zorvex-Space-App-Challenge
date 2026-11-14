/**
 * The opening journey (docs/BUILD_GUIDE.md): Home on Earth at night -> first-person take-off ->
 * choose Moon or Mars -> first-person landing -> the explorers -> hologram launch -> the story.
 * One canvas for the whole flight; the phase in journey/store.ts decides what is on screen.
 */
import gsap from 'gsap';
import type { Object3D } from 'three';
import { DirectionalLight, Group, HemisphereLight, PerspectiveCamera, Raycaster, Scene, Vector2, Vector3 } from 'three';
import { button, el, link } from '../dom';
import { audio } from '../engine/audio';
import { t } from '../engine/i18n';
import { progress } from '../engine/progress';
import { Renderer } from '../engine/renderer';
import { go, type Page } from '../engine/router';
import { Scope } from '../engine/scope';
import { findEpisode } from '../episodes';
import type { Explorer } from '../journey/explorers';
import { NASA_MODELS, nasaModel, loadNasaModel } from '../journey/nasaModels';
import { COLORS, createChild, createDesert, createNightSky, createPlanet, createRocket, createShootingStars, createStars } from '../journey/props';
import { journey, type Destination, type Phase } from '../journey/store';
import { buildSurface, disposeSurface, hasNasaModel, updateSurface, type Surface } from '../journey/surface';

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Cutscene time factor: reduced motion plays every cutscene almost instantly. */
const D = REDUCED ? 0.02 : 1;
const DESTINATIONS: Destination[] = ['moon', 'mars'];
const CUTSCENES: Phase[] = ['HOME_WALK', 'TAKEOFF', 'LANDING'];
const HOME_CAM = { pos: [0, 1.5, 9], look: [0, 2.5, 0] } as const;
/** The destination screen uses a long lens from far away, so the globes stay round at the screen edges. */
const SPACE_CAM = { z: 28, fov: 19, halfHeight: 4.66 };
/** Share of a wide screen that the hologram panel covers. */
const PANEL_SHARE = 0.32;
const ROCKET_X = 3.4;
const ROCKET_HEIGHT = 6.4;
const CHILD_HEIGHT = 1.05;
const CHILD_START_X = -0.6;

export const journeyPage: Page = (root) => {
  const shell = el('div', 'journey', undefined, root);
  const canvas = el('canvas', 'gl', undefined, shell);
  canvas.setAttribute('aria-hidden', 'true');
  let renderer: Renderer;
  try {
    renderer = new Renderer(canvas, progress.get().quality);
  } catch {
    el('div', 'fallback', t('ui.noWebgl'), shell);
    return;
  }
  const session = new Scope();
  const anisotropy = renderer.gl.capabilities.getMaxAnisotropy();

  // ---------- the flight scene: Earth at night, then open space ----------
  const scene = new Scene();
  const camera = new PerspectiveCamera(50, 1, 0.1, 3000);
  const cam = { pos: new Vector3(...HOME_CAM.pos), look: new Vector3(...HOME_CAM.look), shake: 0 };
  const stars = createStars(3000, 120);
  const nightSky = createNightSky();
  const shooting = createShootingStars();
  const earth = new Group();
  const rocket = createRocket();
  const child = createChild();
  rocket.group.position.x = ROCKET_X;
  // NASA's own Saturn V and crew escape suit replace the stand-ins as soon as they load
  void nasaModel('saturn-v', { size: ROCKET_HEIGHT, by: 'height' }).then((model) => {
    if (!model) return;
    for (const part of rocket.group.children) if (part !== rocket.glow) part.visible = false;
    rocket.group.add(model);
  });
  void nasaModel('crew-escape-suit', { size: CHILD_HEIGHT, by: 'height' }).then((model) => {
    if (!model) return;
    for (const part of child.group.children) part.visible = false;
    child.group.add(model);
  });
  // the explorers' models load in the background while the child is still on Earth
  for (const key of Object.keys(NASA_MODELS) as (keyof typeof NASA_MODELS)[]) void loadNasaModel(key);
  const moonlight = new DirectionalLight(0x9fb4ff, 2.2);
  moonlight.position.set(-6, 9, 5);
  // a soft front light so the rocket and the young explorer read clearly against the night
  const fill = new DirectionalLight(0xc8d4ff, 1.6);
  fill.position.set(2, 3, 10);
  earth.add(createDesert(), rocket.group, child.group, shooting.group, new HemisphereLight(0x33406a, 0x120e0c, 2.4), moonlight, fill);
  const space = new Group();
  const sun = new DirectionalLight(0xffffff, 3.2);
  sun.position.set(-6, 4, 8);
  space.add(sun, new HemisphereLight(0x223355, 0x000000, 0.25));
  const planets = DESTINATIONS.map((kind) => createPlanet(kind, anisotropy));
  for (const p of planets) space.add(p.group);
  scene.add(nightSky.mesh, stars.points, earth, space);

  // ---------- HTML overlays (all text lives here, never inside WebGL) ----------
  const title = el('header', 'j-title', undefined, shell);
  el('h1', '', t('ui.title'), title);
  el('p', '', t('ui.subtitle'), title);
  const homeSources = link('j-sources', t('ui.home.sources'), '#about', shell);
  const startBtn = button('j-start', t('ui.start'), () => {
    audio.init();
    journey.start();
  }, shell);
  const cockpit = el('div', 'j-cockpit', undefined, shell);
  const dash = el('div', 'j-dash', undefined, el('div', 'j-window', undefined, cockpit));
  for (let i = 0; i < 7; i++) el('i', '', undefined, dash);
  const hud = el('div', 'j-hud', undefined, shell);
  hud.setAttribute('aria-live', 'assertive');
  const pick = el('div', 'j-pick', undefined, shell);
  el('h2', '', t('ui.journey.select'), pick);
  const pickBtns = DESTINATIONS.map((kind) => button('j-planet', t(`ui.journey.${kind}`), () => journey.choose(kind), pick));
  const field = el('div', 'j-field', undefined, shell);
  const fieldTitle = el('h2', '', undefined, field);
  el('p', '', t('ui.journey.hint'), field);
  const nav = el('nav', 'j-nav', undefined, field);
  button('chip', t('ui.journey.change'), () => journey.travel(), nav);
  link('chip', t('ui.shelf'), '#shelf', nav);
  link('chip', t('ui.about'), '#about', nav);
  const plaques = el('div', 'j-plaques', undefined, field);
  const holo = el('aside', 'holo', undefined, field);
  holo.hidden = true;
  const skip = button('j-skip', t('ui.skip'), () => timeline?.progress(1), shell);
  const blackout = el('div', 'j-blackout', undefined, shell);

  // ---------- state shared by the phases ----------
  let surface: Surface | null = null;
  let timeline: gsap.core.Timeline | null = null;
  let phaseScope = session.child();
  let focused = 0;
  const pointer = new Vector2();
  const raycaster = new Raycaster();
  const tmp = new Vector3();

  const show = (node: HTMLElement, visible: boolean): void => {
    node.hidden = !visible;
  };
  const say = (text: string): void => {
    hud.textContent = text;
    gsap.fromTo(hud, { opacity: 1, scale: 1.25 }, { opacity: text ? 1 : 0, scale: 1, duration: 0.3 });
  };
  const useScene = (which: Scene): void => renderer.setScene(which, camera);
  /** Set the lens. On wide screens `panelShare` of the width is kept free on the right for the hologram panel. */
  const setFov = (fov: number, panelShare = 0): void => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.fov = fov;
    if (panelShare > 0 && w > h) camera.setViewOffset(w, h, (w * panelShare) / 2, 0, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  };
  const layout = (): void => {
    const aspect = window.innerWidth / window.innerHeight;
    camera.aspect = aspect;
    if (surface && journey.get().phase === 'EXPLORERS') setFov(surface.view.fov, PANEL_SHARE);
    else camera.updateProjectionMatrix();
    renderer.resize();
    // side by side on wide screens, stacked on tall ones
    const halfWidth = SPACE_CAM.halfHeight * aspect;
    planets.forEach((p, i) => {
      const side = i === 0 ? -1 : 1;
      p.group.position.set(aspect >= 1 ? side * halfWidth * 0.52 : 0, aspect >= 1 ? 0 : -side * 2.4, 0);
      p.group.userData.size = aspect >= 1 ? Math.min(SPACE_CAM.halfHeight * 0.62, halfWidth * 0.3) : Math.min(2, halfWidth * 0.85);
    });
  };
  const ensureSurface = (destination: Destination): Surface => {
    if (surface?.destination !== destination) {
      if (surface) disposeSurface(surface);
      surface = buildSurface(destination, renderer.quality, anisotropy, renderer.gl);
      buildPlaques(surface);
    }
    return surface;
  };

  // ---------- Screen 3 helpers: plaques, hologram panel, launch ----------
  const years = (e: Explorer): string =>
    e.years.end === e.years.start ? String(e.years.start) : `${e.years.start} – ${e.years.end ?? t('ui.years.present')}`;

  function buildPlaques(s: Surface): void {
    plaques.replaceChildren();
    for (const item of s.items) {
      const e = item.explorer;
      // neighbours stand close together, so every second plaque sits one row lower
      const row = s.items.indexOf(item) % 2 ? ' low' : '';
      const plaque = button(`j-plaque ${e.status}${row}`, '', (event) => {
        // touch: first tap selects, the Explore button continues. Mouse and keyboard: go.
        const touch = event instanceof PointerEvent && event.pointerType === 'touch';
        if (touch && journey.get().hoveredId !== e.id) journey.hover(e.id);
        else launch(e.id);
      }, plaques);
      el('b', '', e.name, plaque);
      el('span', '', `${t(`ui.status.${e.status}`)} · ${years(e)}`, plaque);
      plaque.addEventListener('focus', () => journey.hover(e.id));
      plaque.addEventListener('pointerenter', () => journey.hover(e.id));
    }
  }

  function showPanel(id: string | null): void {
    const e = surface?.items.find((item) => item.explorer.id === id)?.explorer;
    show(holo, Boolean(e));
    if (!e) return;
    holo.replaceChildren();
    el('h2', '', e.name, holo);
    const meta = el('div', 'holo-meta', undefined, holo);
    el('span', `holo-chip ${e.status}`, t(`ui.status.${e.status}`), meta);
    el('span', '', t(`ui.type.${e.type}`), meta);
    el('span', '', years(e), meta);
    el('p', '', e.summary, holo);
    el('div', 'holo-route', t('ui.holo.route'), holo);
    // where every word on this panel comes from
    const sources = el('div', 'holo-sources', undefined, holo);
    el('b', '', t('ui.holo.sources'), sources);
    for (const s of e.sources) link('', s.label, s.url, sources);
    el('span', '', t(hasNasaModel(e.id) ? 'ui.holo.model' : 'ui.holo.standin'), sources);
    button('holo-explore', t('ui.holo.explore'), () => launch(e.id), holo);
    holo.classList.remove('in');
    void holo.offsetWidth; // restart the appear animation
    holo.classList.add('in');
    audio.play('pop');
  }

  /** Transition 3: the hologram shoots at the screen, flash, black, then the story. */
  function launch(id: string): void {
    if (journey.get().phase !== 'EXPLORERS') return;
    journey.explore(id);
  }

  // ---------- the phases ----------
  const ENTER: Record<Phase, () => void> = {
    HOME() {
      useScene(scene);
      setFov(50);
      earth.visible = nightSky.mesh.visible = true;
      space.visible = false;
      rocket.group.visible = child.group.visible = true;
      child.group.position.set(CHILD_START_X, 0, 0.6);
      child.group.rotation.y = 0.4;
      child.group.scale.setScalar(1);
      rocket.door.position.z = 0.52;
      nightSky.bottom.set(COLORS.duskBlue);
      stars.material.uniforms.uBright.value = 1;
      cam.pos.set(...HOME_CAM.pos);
      cam.look.set(...HOME_CAM.look);
      gsap.set([title, startBtn, homeSources], { opacity: 1 });
      show(title, true);
      show(startBtn, true);
      show(homeSources, true);
      startBtn.focus();
      // idle: the child breathes and looks up at the stars
      phaseScope.frame((_dt, time) => {
        child.group.scale.y = 1 + Math.sin(time * 1.6) * 0.012;
        child.head.rotation.x = -0.35 + Math.sin(time * 0.5) * 0.12;
      });
    },
    HOME_WALK() {
      const walk = { on: false };
      phaseScope.frame((_dt, time) => {
        const swing = walk.on ? Math.sin(time * 9) * 0.6 : 0;
        child.group.position.y = walk.on ? Math.abs(Math.sin(time * 9)) * 0.05 : 0;
        child.legs[0].rotation.x = swing;
        child.legs[1].rotation.x = -swing;
      });
      timeline = gsap
        .timeline({ onComplete: () => journey.finish('HOME_WALK') })
        .to([title, startBtn, homeSources], { opacity: 0, duration: 0.3 * D })
        .to(child.group.rotation, { y: Math.PI / 2, duration: 0.5 * D })
        .call(() => void (walk.on = true))
        .to(child.group.position, { x: ROCKET_X - 0.85, z: 0, duration: 3 * D, ease: 'none' })
        .call(() => void (walk.on = false))
        .to(child.group.scale, { x: 0.6, y: 0.6, z: 0.6, duration: 0.4 * D })
        .to(child.group.position, { x: ROCKET_X - 0.4, duration: 0.4 * D }, '<')
        .call(() => void (child.group.visible = false))
        .to(rocket.door.position, { z: 0, duration: 1 * D, ease: 'power2.in' })
        .call(() => audio.play('thud'));
    },
    TAKEOFF() {
      show(title, false);
      show(startBtn, false);
      show(homeSources, false);
      show(cockpit, true);
      rocket.group.visible = child.group.visible = false;
      cam.pos.set(ROCKET_X, 2.7, 0);
      cam.look.set(ROCKET_X, 2.9, -60);
      phaseScope.frame(() => audio.drive(cam.shake));
      phaseScope.add(() => audio.drive(0));
      const count = (n: string): void => {
        say(n);
        audio.play('beep');
      };
      timeline = gsap
        .timeline({ onComplete: () => journey.finish('TAKEOFF') })
        .fromTo(cockpit, { opacity: 0 }, { opacity: 1, duration: 0.4 * D })
        .to(cam, { shake: 0.3, duration: 2 * D }, 1 * D)
        .call(() => count('3'), [], 1 * D)
        .call(() => count('2'), [], 1.67 * D)
        .call(() => count('1'), [], 2.33 * D)
        .call(() => say(t('ui.journey.liftoff')), [], 3 * D)
        .to(cam, { shake: 1, duration: 1 * D }, 3 * D)
        .to(cam.pos, { y: 420, duration: 3 * D, ease: 'power2.in' }, 3 * D)
        .to(cam.look, { y: 520, duration: 3 * D, ease: 'power2.in' }, 3 * D)
        .to(nightSky.bottom, { r: 0.004, g: 0.005, b: 0.01, duration: 3 * D }, 3 * D)
        .to(stars.material.uniforms.uBright, { value: 1.9, duration: 3 * D }, 3 * D)
        .to(cam, { shake: 0, duration: 1.1 * D }, 6 * D)
        .call(() => say(''), [], 6 * D)
        .to(blackout, { opacity: 1, duration: 0.4 * D }, 7.1 * D);
    },
    DESTINATION() {
      useScene(scene);
      layout();
      earth.visible = nightSky.mesh.visible = false;
      space.visible = true;
      show(cockpit, false);
      show(pick, true);
      cam.shake = 0;
      setFov(SPACE_CAM.fov);
      cam.pos.set(0, 0, SPACE_CAM.z);
      cam.look.set(0, 0, 0);
      stars.material.uniforms.uBright.value = 1.6;
      gsap.to(blackout, { opacity: 0, duration: 0.6 });
      const focus = (i: number): void => {
        focused = i;
        pickBtns.forEach((b, k) => b.classList.toggle('on', k === i));
      };
      pickBtns.forEach((b, i) => {
        phaseScope.listen(b, 'focus', () => focus(i));
        phaseScope.listen(b, 'pointerenter', () => focus(i));
      });
      const hit = (e: PointerEvent): number => {
        pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
        raycaster.setFromCamera(pointer, camera);
        return planets.findIndex((p) => raycaster.intersectObject(p.globe).length > 0);
      };
      phaseScope.listen(canvas, 'pointermove', (e: PointerEvent) => {
        const i = hit(e);
        canvas.style.cursor = i >= 0 ? 'pointer' : '';
        if (i >= 0) focus(i);
      });
      phaseScope.listen(canvas, 'click', (e: PointerEvent) => {
        const i = hit(e);
        if (i >= 0) journey.choose(DESTINATIONS[i]);
      });
      phaseScope.listen(window, 'keydown', (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') pickBtns[0].focus();
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') pickBtns[1].focus();
      });
      pickBtns[focused].focus();
      phaseScope.add(() => (canvas.style.cursor = ''));
    },
    LANDING() {
      const destination = journey.get().destination!;
      const target = planets[DESTINATIONS.indexOf(destination)].group;
      const place = t(`ui.journey.${destination}`);
      show(pick, false);
      show(cockpit, true);
      say(t('ui.journey.landing', { place }));
      phaseScope.frame(() => audio.drive(cam.shake));
      phaseScope.add(() => audio.drive(0));
      const reach = (target.userData.size as number) + 0.9;
      timeline = gsap
        .timeline({ onComplete: () => journey.finish('LANDING') })
        .fromTo(cockpit, { opacity: 0 }, { opacity: 1, duration: 0.5 * D })
        .to(cam, { shake: 0.25, duration: 1 * D }, 0)
        .to(cam.look, { x: target.position.x, y: target.position.y, duration: 1 * D }, 0)
        .to(cam.pos, { x: target.position.x, y: target.position.y, z: reach, duration: 3 * D, ease: 'power2.in' }, 1 * D)
        .to(blackout, { opacity: 1, duration: 0.3 * D })
        .call(() => {
          // cut to the surface: the rocket is now coming down over the landing ground
          const s = ensureSurface(destination);
          useScene(s.scene);
          setFov(s.view.fov, PANEL_SHARE);
          cam.pos.set(0, 46, 30);
          cam.look.copy(s.view.look);
        })
        .to(blackout, { opacity: 0, duration: 0.3 * D })
        .to(cam.pos, { x: () => ensureSurface(destination).view.pos.x, y: () => ensureSurface(destination).view.pos.y, z: () => ensureSurface(destination).view.pos.z, duration: 2.2 * D, ease: 'power2.out' })
        .call(() => {
          const s = ensureSurface(destination);
          const dust = destination === 'moon' ? 'moonDust' : 'dustBurst';
          for (const x of [-3, 0, 3]) s.fx.burst(dust, tmp.set(x, s.world.heightAt(x, 11), 11));
          audio.play('thud');
        }, [], '-=0.7')
        .fromTo(cam, { shake: 1 }, { shake: 0, duration: 0.6 * D }, '-=0.6')
        .to(cockpit, { opacity: 0, duration: 0.5 * D });
    },
    EXPLORERS() {
      const s = ensureSurface(journey.get().destination!);
      useScene(s.scene);
      setFov(s.view.fov, PANEL_SHARE);
      show(cockpit, false);
      show(pick, false);
      show(field, true);
      say('');
      gsap.set(blackout, { opacity: 0 });
      gsap.set(holo, { clearProps: 'all' });
      cam.shake = 0;
      cam.pos.copy(s.view.pos);
      cam.look.copy(s.view.look);
      fieldTitle.textContent = t(`ui.journey.explorers.${s.destination}`);
      const pickAt = (e: PointerEvent): string | null => {
        pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
        raycaster.setFromCamera(pointer, camera);
        let node: Object3D | null = raycaster.intersectObjects(s.items.map((item) => item.root))[0]?.object ?? null;
        while (node && !node.userData.explorerId) node = node.parent;
        return (node?.userData.explorerId as string | undefined) ?? null;
      };
      phaseScope.listen(canvas, 'pointermove', (e: PointerEvent) => {
        const id = pickAt(e);
        canvas.style.cursor = id ? 'pointer' : '';
        if (id) journey.hover(id);
      });
      phaseScope.listen(canvas, 'click', (e: PointerEvent) => {
        const id = pickAt(e);
        if (!id) return;
        if (e.pointerType === 'touch' && journey.get().hoveredId !== id) journey.hover(id);
        else launch(id);
      });
      phaseScope.add(() => (canvas.style.cursor = ''));
      showPanel(journey.get().hoveredId);
    },
    HOLOGRAM_LAUNCH() {
      audio.play('whoosh');
      timeline = gsap.timeline({ onComplete: () => journey.finish('HOLOGRAM_LAUNCH') });
      if (!REDUCED) timeline.to(holo, { scale: 12, opacity: 0.9, filter: 'blur(6px) brightness(2)', duration: 0.7, ease: 'power3.in' });
      timeline
        .set(blackout, { backgroundColor: '#bfeeff', opacity: 1 })
        .to(blackout, { backgroundColor: '#000000', duration: 0.4, delay: 0.08 })
        .to({}, { duration: 0.5 });
    },
    BLACKOUT() {
      journey.finish('BLACKOUT');
    },
    STORY() {
      const id = journey.get().selectedId!;
      go(findEpisode(id) ? `#ep-${id}` : `#story-${id}`);
    },
  };

  function enter(phase: Phase): void {
    timeline?.kill();
    timeline = null;
    phaseScope.dispose();
    phaseScope = session.child();
    show(skip, CUTSCENES.includes(phase));
    if (phase !== 'EXPLORERS' && phase !== 'HOLOGRAM_LAUNCH') show(field, false);
    ENTER[phase]();
  }

  // ---------- wiring ----------
  // coming back from a story lands on the explorers again; a fresh visit starts at Home
  journey.resume();
  session.add(journey.subscribe((state, previous) => {
    if (state.phase !== previous.phase) enter(state.phase);
    else if (state.hoveredId !== previous.hoveredId) showPanel(state.hoveredId);
  }));
  session.listen(window, 'resize', layout);
  const mouse = { x: 0, y: 0 };
  session.listen(window, 'pointermove', (e: PointerEvent) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  let last = performance.now();
  let raf = 0;
  const parallax = new Vector2();
  const frame = (now: number): void => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    const time = now / 1000;
    last = now;
    const { phase, hoveredId } = journey.get();
    stars.material.uniforms.uTime.value = time;
    if (!REDUCED && earth.visible && rocket.group.visible) shooting.update(dt);
    planets.forEach((p, i) => {
      p.globe.rotation.y += dt * 0.12;
      const on = phase === 'DESTINATION' && i === focused;
      const size = (p.group.userData.size as number) * (on ? 1.08 : 1);
      p.group.scale.setScalar(p.group.scale.x + (size - p.group.scale.x) * Math.min(1, dt * 8));
      const rim = p.rim.material as (typeof stars)['material'];
      // idle: Mars keeps the faint haze of its thin air, the airless Moon has none
      const idle = i === 1 ? 0.18 : 0;
      rim.uniforms.strength.value += ((on ? 0.8 : idle) - rim.uniforms.strength.value) * Math.min(1, dt * 8);
    });
    // camera: scripted position + a little mouse parallax + cutscene shake
    const drift = REDUCED || CUTSCENES.includes(phase) ? 0 : 1;
    parallax.x += (mouse.x * 0.25 * drift - parallax.x) * 0.05;
    parallax.y += (-mouse.y * 0.12 * drift - parallax.y) * 0.05;
    const shake = REDUCED ? 0 : cam.shake;
    camera.position.set(
      cam.pos.x + parallax.x + Math.sin(time * 60) * 0.03 * shake,
      cam.pos.y + parallax.y + Math.cos(time * 55) * 0.03 * shake,
      cam.pos.z,
    );
    camera.lookAt(cam.look);
    stars.points.position.copy(camera.position);
    nightSky.mesh.position.copy(camera.position);
    const onSurface = surface && (phase === 'EXPLORERS' || phase === 'HOLOGRAM_LAUNCH' || phase === 'LANDING');
    if (surface && onSurface) {
      updateSurface(surface, dt, time, camera, hoveredId);
      surface.items.forEach((item, i) => {
        tmp.copy(item.plaqueAt).project(camera);
        const plaque = plaques.children[i] as HTMLElement;
        plaque.style.left = `${(tmp.x * 0.5 + 0.5) * 100}%`;
        plaque.style.top = `${(-tmp.y * 0.5 + 0.5) * 100}%`;
      });
    }
    renderer.render(dt);
  };

  for (const node of [cockpit, pick, field, skip]) show(node, false);
  layout();
  enter(journey.get().phase);
  raf = requestAnimationFrame(frame);
  session.add(() => {
    cancelAnimationFrame(raf);
    timeline?.kill();
    if (surface) disposeSurface(surface);
    renderer.dispose();
    audio.drive(0);
  });
  return () => session.dispose();
};
