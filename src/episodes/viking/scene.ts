/**
 * Viking's three stages:
 *  - earth: Launch Complex 41 with a Titan IIIE-Centaur and its tower;
 *  - space: Earth, Mars (NASA images), and the orbiter carrying its lander in the aeroshell,
 *    built from NASA's labelled orbiter drawing (NASA 3D Resources has no orbiter model);
 *  - mars:  the lander itself (NASA 3D Resources model) with its aeroshell, parachute and
 *    landing engines for the descent, and markers for its instruments.
 * 1 unit = 1 metre for the machines; the planets are not to scale with them.
 */
import {
  AdditiveBlending,
  BackSide,
  BoxGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  InstancedMesh,
  LatheGeometry,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PointLight,
  Quaternion,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
  Vector3,
} from 'three';
import gsap from 'gsap';
import earthMap from '../../assets/planets/earth.png';
import marsMap from '../../assets/planets/mars.jpg';
import { buildPlaceholder, part, partsFromModel, tube, type MachineMaterials } from '../../engine/models';
import { hash } from '../../engine/noise';
import type { Scope } from '../../engine/scope';
import type { EpisodeContext, SceneBuild, SceneHandles } from '../../engine/types';
import { createRockMaterial, rockGeometry } from '../../engine/worlds/mars';
import { onGlobe } from '../../journey/geo';
import { nasaModel } from '../../journey/nasaModels';
import firstImage from './assets/first-image.jpg';
import utopiaColor from './assets/utopia-color.jpg';

const MARS_RADIUS = 30;
const EARTH_RADIUS = 56;
const EARTH_AT = new Vector3(-900, 120, -700);
const ORBIT_RADIUS = 46;
const LANDER_HEIGHT = 2.2;
const TILT_VIKING_2 = (8.5 * Math.PI) / 180; // NASA: "tilted 8.5 degrees to the west"

/** Landing sites from NASA's mission pages (Viking 2 page gives 225.71° W = 134.29° E). */
const SITES = {
  viking1: { lat: 22.483, lon: -47.94 },
  viking2: { lat: 47.968, lon: 134.29 },
  // "the primary landing site in the Chryse region": shown east of the western slopes, not a NASA coordinate
  firstChoice: { lat: 18, lon: -36 },
};

function globe(map: string, radius: number, rim: number, anisotropy: number): Group {
  const texture = new TextureLoader().load(map);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = anisotropy;
  const g = new Group();
  const ball = new Mesh(new SphereGeometry(radius, 96, 64), new MeshStandardMaterial({ map: texture, roughness: 0.95, metalness: 0 }));
  g.add(ball);
  const haze = new Mesh(
    new SphereGeometry(radius * 1.025, 64, 48),
    new ShaderMaterial({
      uniforms: { color: { value: new Color(rim) } },
      vertexShader:
        'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
      fragmentShader:
        'uniform vec3 color; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 3.0); gl_FragColor = vec4(color * 1.4, f * 0.9); }',
      side: BackSide,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  );
  g.add(haze);
  return g;
}

/** A small glowing ring lying on a globe at a latitude and longitude. */
function siteMarker(lat: number, lon: number, color: number): Mesh {
  const marker = new Mesh(
    new CylinderGeometry(1.5, 1.5, 0.2, 40, 1, true),
    new MeshBasicMaterial({ color: new Color(color).multiplyScalar(2), transparent: true, opacity: 0.95, side: DoubleSide }),
  );
  const at = onGlobe(lat, lon, MARS_RADIUS + 0.1);
  marker.position.copy(at);
  marker.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), at.clone().normalize());
  return marker;
}

/** Titan IIIE-Centaur: a two-stage core, two solid rocket motors, the Centaur shroud on top. Half scale. */
function buildTitan(): { rocket: Group; flames: Mesh[] } {
  const rocket = new Group();
  const white = new MeshStandardMaterial({ color: 0xe9e6de, roughness: 0.55, metalness: 0.15 });
  const grey = new MeshStandardMaterial({ color: 0xb9b4a8, roughness: 0.6, metalness: 0.2 });
  const dark = new MeshStandardMaterial({ color: 0x24252a, roughness: 0.7 });
  part(rocket, new CylinderGeometry(1.5, 1.5, 30, 32), grey, 0, 15, 0);
  for (const y of [9.5, 22]) part(rocket, new CylinderGeometry(1.52, 1.52, 0.6, 32), dark, 0, y, 0);
  // Centaur and Viking under the payload shroud
  part(rocket, new CylinderGeometry(2.1, 1.5, 1.2, 32), white, 0, 30.6, 0);
  part(rocket, new CylinderGeometry(2.1, 2.1, 8.5, 32), white, 0, 35.45, 0);
  const nose = new LatheGeometry(
    [new Vector2(2.1, 0), new Vector2(1.9, 1.6), new Vector2(1.2, 3.4), new Vector2(0.3, 4.4), new Vector2(0, 4.6)],
    32,
  );
  part(rocket, nose, white, 0, 39.7, 0);
  const flames: Mesh[] = [];
  const flameMat = new MeshBasicMaterial({ color: new Color(0xffa040).multiplyScalar(3), transparent: true, opacity: 0.9, depthWrite: false });
  for (const side of [-1, 1]) {
    const x = side * 3.15;
    part(rocket, new CylinderGeometry(1.55, 1.55, 26, 32), white, x, 13.5, 0);
    for (let k = 0; k < 6; k++) part(rocket, new CylinderGeometry(1.57, 1.57, 0.3, 32), dark, x, 3 + k * 4, 0);
    part(rocket, new ConeGeometry(1.55, 3.2, 32), white, x, 28.1, 0);
    part(rocket, new CylinderGeometry(1.2, 1.6, 1.2, 24), dark, x, 0.1, 0);
    tube(rocket, new Vector3(x * 0.55, 6, 0), new Vector3(x * 0.85, 6, 0), 0.15, grey);
    tube(rocket, new Vector3(x * 0.55, 22, 0), new Vector3(x * 0.85, 22, 0), 0.15, grey);
    const flame = new Mesh(new ConeGeometry(1.6, 9, 24, 1, true), flameMat);
    flame.rotation.x = Math.PI;
    flame.position.set(x, -4.6, 0);
    flame.visible = false;
    rocket.add(flame);
    flames.push(flame);
  }
  return { rocket, flames };
}

/** The launch tower beside the pad. */
function buildTower(): Group {
  const tower = new Group();
  const steel = new MeshStandardMaterial({ color: 0x8c3a2c, roughness: 0.7, metalness: 0.4 });
  for (const [x, z] of [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]]) part(tower, new BoxGeometry(0.35, 52, 0.35), steel, x, 26, z);
  for (let y = 4; y < 52; y += 4) {
    part(tower, new BoxGeometry(3.9, 0.25, 0.25), steel, 0, y, -1.8);
    part(tower, new BoxGeometry(3.9, 0.25, 0.25), steel, 0, y, 1.8);
    part(tower, new BoxGeometry(0.25, 0.25, 3.9), steel, -1.8, y, 0);
  }
  tower.position.set(10, 0, -2);
  return tower;
}

/** The aeroshell: a wide, shallow shell (heat shield below, base cover above). */
function buildAeroshell(): Group {
  const shell = new Group();
  const bowl = new LatheGeometry(
    [new Vector2(0, -0.7), new Vector2(1.2, -0.62), new Vector2(1.75, -0.35), new Vector2(1.85, 0), new Vector2(1.8, 0.12)],
    48,
  );
  const heatShield = new MeshStandardMaterial({ color: 0xa89a82, roughness: 0.9, emissive: new Color(0xff6a20), emissiveIntensity: 0 });
  part(shell, bowl, heatShield);
  const cover = new LatheGeometry([new Vector2(1.8, 0.12), new Vector2(1.6, 0.6), new Vector2(0.9, 1.0), new Vector2(0, 1.1)], 48);
  part(shell, cover, new MeshStandardMaterial({ color: 0xc9c3b6, roughness: 0.85, side: DoubleSide }));
  shell.userData.heatShield = heatShield;
  return shell;
}

/** Viking orbiter, following NASA's labelled drawing: octagon bus, four two-panel wings, tanks, dish. */
function buildOrbiter(mats: MachineMaterials): Group {
  const orbiter = new Group();
  part(orbiter, new CylinderGeometry(1.25, 1.25, 0.46, 8), mats.gold, 0, 0, 0);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
    const louver = part(orbiter, new BoxGeometry(0.5, 0.3, 0.02), mats.alu, Math.cos(a) * 1.16, 0, Math.sin(a) * 1.16);
    louver.rotation.y = -a + Math.PI / 2;
  }
  // propellant tanks and the orbiter propulsion motor on top
  for (const x of [-0.35, 0.35]) part(orbiter, new CylinderGeometry(0.42, 0.42, 1.3, 20), mats.white, x, 0.95, 0);
  for (const x of [-0.35, 0.35]) part(orbiter, new SphereGeometry(0.42, 20, 12), mats.white, x, 1.6, 0);
  part(orbiter, new ConeGeometry(0.3, 0.55, 18, 1, true), mats.dark, 0, 2.1, 0);
  // four solar wings, two panels each (each panel 1.57 x 1.23 m)
  for (let w = 0; w < 4; w++) {
    const wing = new Group();
    wing.rotation.y = (w / 4) * Math.PI * 2 + Math.PI / 4;
    for (const d of [2.25, 3.85]) part(wing, new BoxGeometry(1.57, 0.04, 1.23), mats.solar, d, 0, 0);
    tube(wing, new Vector3(1.2, 0, 0), new Vector3(1.48, 0, 0), 0.04, mats.alu);
    orbiter.add(wing);
  }
  // S- and X-band high-gain dish (about 1.5 m), low-gain mast, relay antenna, scan platform with cameras
  const dish = part(orbiter, new SphereGeometry(0.75, 32, 12, 0, Math.PI * 2, 0, Math.PI / 3.2), mats.white, 1.6, -0.3, 0.9);
  dish.material = new MeshStandardMaterial({ color: 0xe8e4da, roughness: 0.6, side: DoubleSide });
  dish.rotation.set(-1.2, 0, 0.6);
  tube(orbiter, new Vector3(1.0, -0.1, 0.6), new Vector3(1.5, -0.3, 0.85), 0.03, mats.alu);
  tube(orbiter, new Vector3(-0.9, 0.2, -0.7), new Vector3(-0.9, 1.6, -0.7), 0.025, mats.alu);
  part(orbiter, new CylinderGeometry(0.12, 0.05, 0.08, 16), mats.white, -0.9, 1.65, -0.7);
  const platform = new Group();
  part(platform, new BoxGeometry(0.6, 0.3, 0.9), mats.white, 0, 0, 0);
  for (const x of [-0.14, 0.14]) part(platform, new CylinderGeometry(0.1, 0.1, 0.5, 16), mats.dark, x, -0.1, 0.55).rotation.x = Math.PI / 2;
  platform.position.set(0.3, -0.75, -0.9);
  orbiter.add(platform);
  return orbiter;
}

function buildParachute(): Group {
  const chute = new Group();
  // NASA NSSDCA: a 16-metre parachute
  const canopy = new Mesh(
    new SphereGeometry(8, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2.6),
    new MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.9, side: DoubleSide }),
  );
  canopy.position.y = 18;
  canopy.castShadow = true;
  chute.add(canopy);
  const lineMat = new MeshBasicMaterial({ color: 0xbdb6a6 });
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    tube(chute, new Vector3(0, 2.6, 0), new Vector3(Math.cos(a) * 6.3, 21.6 - 3.6, Math.sin(a) * 6.3), 0.02, lineMat);
  }
  chute.visible = false;
  return chute;
}

export default async function buildScene({ scene, world, materials, anisotropy, stage }: SceneBuild): Promise<SceneHandles> {
  const objects: Record<string, Object3D> = {};

  // ---------- Earth: the launch pad ----------
  const earthStage = stage('earth');
  const { rocket, flames } = buildTitan();
  earthStage.scene.add(rocket, buildTower());
  // the engines light up the pad and the smoke
  const exhaust = new PointLight(0xff8a30, 0, 160, 1.4);
  exhaust.position.set(0, -4, 0);
  rocket.add(exhaust);
  objects.titan = rocket;

  // ---------- space: Earth, Mars, the orbiter with its lander ----------
  const spaceStage = stage('space');
  const mars = globe(marsMap, MARS_RADIUS, 0xe2a070, anisotropy);
  const earth = globe(earthMap, EARTH_RADIUS, 0x6fa8ff, anisotropy);
  earth.position.copy(EARTH_AT);
  spaceStage.scene.add(mars, earth);
  const markerV1 = siteMarker(SITES.viking1.lat, SITES.viking1.lon, 0x5be38a);
  const markerFirst = siteMarker(SITES.firstChoice.lat, SITES.firstChoice.lon, 0xffb84a);
  const markerV2 = siteMarker(SITES.viking2.lat, SITES.viking2.lon, 0x4fd8ff);
  mars.add(markerV1, markerFirst, markerV2);
  Object.assign(objects, { siteViking1: markerV1, siteFirstChoice: markerFirst, siteViking2: markerV2, mars, earth });

  const craft = new Group();
  const orbiter = buildOrbiter(materials);
  const capsule = buildAeroshell();
  capsule.position.y = -1.35;
  craft.add(orbiter, capsule);
  spaceStage.scene.add(craft);
  Object.assign(objects, { craft, capsule });

  // ---------- Mars: the lander ----------
  const model = await nasaModel('viking-lander', { size: LANDER_HEIGHT, by: 'height' });
  // the NASA model's white paint blooms in bright Mars light: tone it down a little
  model?.traverse((o) => {
    if (o instanceof Mesh && o.material instanceof MeshStandardMaterial) {
      o.material = o.material.clone();
      o.material.color.multiplyScalar(0.78);
    }
  });
  const machine = model ? partsFromModel(model, 1, LANDER_HEIGHT + 0.3) : buildPlaceholder(materials);
  const descentShell = buildAeroshell();
  descentShell.scale.setScalar(1.15);
  descentShell.position.y = 0.55;
  descentShell.visible = false;
  const chute = buildParachute();
  chute.position.y = LANDER_HEIGHT;
  const engineFlames = new Group();
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    const f = new Mesh(new ConeGeometry(0.22, 1.6, 16, 1, true), new MeshBasicMaterial({ color: new Color(0x9fd0ff).multiplyScalar(2.5), transparent: true, opacity: 0.8, depthWrite: false }));
    f.rotation.x = Math.PI;
    f.position.set(Math.cos(a) * 0.75, -0.2, Math.sin(a) * 0.75);
    engineFlames.add(f);
  }
  engineFlames.visible = false;
  machine.body.add(descentShell, chute, engineFlames);
  Object.assign(objects, { aeroshell: descentShell, parachute: chute, engines: engineFlames });

  // instrument markers for the laboratory page (invisible points the labels pin to)
  const point = (name: string, x: number, y: number, z: number): void => {
    const o = new Object3D();
    o.position.set(x, y, z);
    machine.body.add(o);
    objects[name] = o;
  };
  point('soil', 2.3, 0, 0.9);
  point('biolab', 0.2, 1.1, 0.2);
  point('gcms', -0.4, 1.05, -0.4);
  point('weatherBoom', -1.0, 1.5, 1.0);

  // extra boulders for Viking 2's rockier site
  const rockCount = 140;
  const utopiaRocks = new InstancedMesh(rockGeometry(31, 1), createRockMaterial(anisotropy, 0x8a6a58), rockCount);
  const m4 = new Matrix4();
  const quat = new Quaternion();
  for (let k = 0; k < rockCount; k++) {
    const a = hash(k, 501) * Math.PI * 2;
    const d = 2.6 + hash(k, 503) ** 1.4 * 16;
    const s = 0.05 + hash(k, 505) ** 2 * 0.35;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    quat.setFromAxisAngle(new Vector3(0, 1, 0), hash(k, 507) * 6.28);
    utopiaRocks.setMatrixAt(k, m4.compose(new Vector3(x, world.heightAt(x, z) + s * 0.25, z), quat, new Vector3(s, s * 0.75, s)));
  }
  utopiaRocks.castShadow = utopiaRocks.receiveShadow = true;
  utopiaRocks.visible = false;
  scene.add(utopiaRocks);

  // ---------- motion ----------
  const motion = { spin: true, orbit: false, orbitAngle: 0.6 };
  /** Turn the craft so the lander (below the orbiter) points down at Mars. */
  const faceMars = (): void => {
    craft.quaternion.setFromUnitVectors(new Vector3(0, -1, 0), craft.position.clone().normalize().negate());
  };
  const tmp = new Vector3();
  let ctx: EpisodeContext | null = null;

  const look = (pos: Vector3, at: Vector3, ms = 0): Promise<void> | undefined =>
    ctx?.director.shot({ pos: [pos.x, pos.y, pos.z], look: [at.x, at.y, at.z], ms });

  /** Run a gsap tween that stops when the page scope ends. */
  const play = (scope: Scope, vars: gsap.TweenVars & { target: object }): Promise<void> =>
    scope.wait(
      new Promise<void>((resolve) => {
        const { target, ...rest } = vars;
        const tw = gsap.to(target, { ...rest, onComplete: resolve });
        scope.add(() => tw.kill());
      }),
    );

  /** A real NASA photo, revealed from left to right like a picture arriving line by line. */
  const photo = async (c: EpisodeContext, scope: Scope, url: string, key: string): Promise<void> => {
    const frame = scope.el('figure', 'first-image', c.comic.gameHost);
    const img = scope.el('img', '', frame);
    img.src = url;
    img.alt = c.t(`${key}.alt`);
    scope.el('figcaption', '', frame, c.t(`${key}.credit`));
    c.audio.play('radio');
    await play(scope, { target: img, clipPath: 'inset(0 0% 0 0)', startAt: { clipPath: 'inset(0 100% 0 0)' }, duration: 5, ease: 'none' });
  };

  return {
    machine,
    objects,
    onReady(context) {
      ctx = context;
    },
    update(dt) {
      if (motion.spin) mars.rotation.y += dt * 0.02;
      earth.rotation.y += dt * 0.03;
      if (motion.orbit) {
        motion.orbitAngle += dt * 0.08;
        craft.position.set(Math.cos(motion.orbitAngle) * ORBIT_RADIUS, 10, Math.sin(motion.orbitAngle) * ORBIT_RADIUS);
        faceMars();
      }
    },
    calls: {
      // ----- Earth -----
      launchPose() {
        gsap.killTweensOf(rocket.position);
        rocket.position.set(0, 0, 0);
        for (const f of flames) f.visible = false;
        void look(tmp.set(46, 9, 62), new Vector3(0, 20, 0));
      },
      async launch(c, scope) {
        for (const f of flames) f.visible = true;
        exhaust.intensity = 0;
        c.audio.play('thud');
        c.audio.play('whoosh');
        c.comic.sfx(c.t('sfx.liftoff'));
        // a billowing cloud on the pad, then a smoke column left behind as it climbs
        for (let k = 0; k < 10; k++) c.fx.burst('smoke', tmp.set((Math.random() - 0.5) * 14, 1, (Math.random() - 0.5) * 14));
        let puff = 0;
        scope.frame((dt, time) => {
          for (const f of flames) f.scale.set(1, 1 + Math.sin(time * 40) * 0.12, 1);
          exhaust.intensity = 900 + Math.sin(time * 33) * 250;
          puff += dt;
          if (puff > 0.08 && rocket.position.y < 200) {
            puff = 0;
            c.fx.burst('smoke', tmp.set((Math.random() - 0.5) * 3, rocket.position.y - 3, (Math.random() - 0.5) * 3));
          }
          const shake = Math.max(0, 1 - rocket.position.y / 120) * 0.35;
          c.director.shot({
            pos: [46 + Math.sin(time * 61) * shake, Math.max(9, rocket.position.y * 0.55 + 9) + Math.cos(time * 53) * shake, 62],
            look: [0, rocket.position.y + 20, 0],
          });
          c.audio.drive(1);
        });
        scope.add(() => {
          c.audio.drive(0);
          exhaust.intensity = 0;
        });
        await play(scope, { target: rocket.position, y: 260, duration: 6.5, ease: 'power2.in' });
      },

      // ----- space -----
      cruisePose() {
        motion.orbit = false;
        motion.spin = true;
        craft.position.set(-640, 90, -480);
        craft.rotation.set(0.3, 0.8, 0);
        capsule.position.set(0, -1.35, 0);
        capsule.visible = true;
        void look(tmp.set(-646, 93, -470), craft.position);
      },
      async cruise(c, scope) {
        // a symbolic path from Earth towards Mars; the real cruise took about ten months
        const travel = { u: 0 };
        const from = new Vector3(-640, 90, -480);
        const to = new Vector3(-70, 18, 60);
        scope.frame(() => {
          craft.position.lerpVectors(from, to, travel.u);
          craft.rotation.y += 0.002;
          c.director.shot({
            pos: [craft.position.x - 7 + travel.u * 2, craft.position.y + 3, craft.position.z + 10],
            look: [craft.position.x, craft.position.y, craft.position.z],
          });
        });
        await play(scope, { target: travel, u: 1, duration: 16, ease: 'sine.inOut' });
      },
      orbitPose() {
        // face Chryse Planitia, where Viking 1 will land
        motion.spin = false;
        mars.rotation.y = 0;
        motion.orbit = true;
        capsule.position.set(0, -1.35, 0);
        capsule.visible = true;
        const chryse = onGlobe(SITES.viking1.lat, SITES.viking1.lon, 1);
        void look(chryse.clone().multiplyScalar(56).add(new Vector3(4, 4, 0)), chryse.clone().multiplyScalar(MARS_RADIUS));
      },
      async separate(c, scope) {
        motion.orbit = false;
        motion.spin = false;
        mars.rotation.y = 0;
        const above = onGlobe(SITES.viking1.lat, SITES.viking1.lon, ORBIT_RADIUS);
        craft.position.copy(above);
        faceMars();
        capsule.position.set(0, -1.35, 0);
        await look(above.clone().add(new Vector3(6, 3, 8)), above, 0);
        c.audio.play('beep');
        c.comic.sfx(c.t('sfx.separation'));
        await play(scope, { target: capsule.position, y: -9, duration: 4, ease: 'power1.in' });
      },
      globePose() {
        motion.orbit = false;
        motion.spin = true;
        craft.position.set(0, 60, 0);
        capsule.visible = false;
        void look(tmp.set(0, 24, 96), new Vector3(0, 0, 0));
      },
      /** Name labels on the two landing sites while the globe turns. */
      siteLabels(c, scope) {
        for (const [name, key] of [['siteViking1', 'site.viking1'], ['siteViking2', 'site.viking2']] as const) {
          const label = scope.el('div', 'pin-btn site-label', c.comic.pinHost, c.t(key));
          scope.frame(() => {
            objects[name].getWorldPosition(tmp);
            const facing = tmp.clone().normalize().dot(c.camera.position.clone().normalize()) > 0.1;
            const s = c.project(tmp);
            label.style.left = `${s.x}px`;
            label.style.top = `${s.y - 14}px`;
            label.style.visibility = s.visible && facing ? 'visible' : 'hidden';
          });
        }
      },

      // ----- Mars -----
      landed(c) {
        c.machine.lift = 0;
        descentShell.visible = false;
        chute.visible = false;
        engineFlames.visible = false;
        machine.body.rotation.x = 0;
        utopiaRocks.visible = false;
      },
      descentPose(c) {
        c.machine.place(0, 0, 0.4);
        c.machine.lift = 120;
        descentShell.visible = true;
        chute.visible = false;
        engineFlames.visible = false;
        (descentShell.userData.heatShield as MeshStandardMaterial).emissiveIntensity = 0;
      },
      firstImage: (c, scope) => photo(c, scope, firstImage, 'img.first'),
      utopiaPhoto: (c, scope) => photo(c, scope, utopiaColor, 'img.utopia'),
      viking2Site(c) {
        c.machine.place(0, 0, 0.4);
        c.machine.lift = 0;
        machine.body.rotation.x = TILT_VIKING_2;
        utopiaRocks.visible = true;
        descentShell.visible = chute.visible = engineFlames.visible = false;
      },
    },
  };
}
