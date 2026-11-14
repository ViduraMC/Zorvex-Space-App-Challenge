/**
 * Pioneer 10/11 scene: the spacecraft (parabolic dish, hexagonal body, 4 RTGs on 2 booms,
 * magnetometer boom, plaque), Jupiter, Saturn with rings, sparse asteroids, and the
 * Pioneer plaque close-up. Everything is built in code. 1 unit ≈ 1 metre.
 *
 * The spacecraft is spin-stabilised (gentle Y rotation in update). The dish faces +x.
 * RTG booms extend along ±z; the magnetometer boom extends along +y.
 */
import {
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  DoubleSide,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  RingGeometry,
  SphereGeometry,
  Vector3,
} from 'three';
import gsap from 'gsap';
import { part, tube, type MachineMaterials, type MachineParts } from '../../engine/models';
import { hash } from '../../engine/noise';
import type { EpisodeContext, SceneBuild, SceneHandles } from '../../engine/types';
import { nasaModel } from '../../journey/nasaModels';

const PLAQUE_Z = 14;
/** Planets sit on the far side from the Sun (sky.ts AZ_DAY), so the camera sees their lit face. */
const JUPITER_AT = new Vector3(-10, -2, -30);
const SATURN_AT = new Vector3(-26, 0, -24);
/** NASA's Pioneer 10 model, fitted to about its real size (the magnetometer boom is the longest side). */
const MODEL_SIZE = 8.2;
/** Share of the model's height below the dish: lifts the dish and body to the origin. */
const DISH_SHARE = 0.82;

// ---------- constants ----------
const DISH_RADIUS = 1.37;
const BODY_RADIUS = 0.32;
const BODY_DEPTH = 0.4;
const BOOM_LENGTH = 2.5;
const RTG_RADIUS = 0.09;
const RTG_LENGTH = 0.28;
const MAG_BOOM_LENGTH = 3.3;

// ---------- Pioneer spacecraft ----------
interface PioneerResult {
  parts: MachineParts;
  boomA: Group;
  boomB: Group;
  magBoom: Group;
}

function buildPioneer(mats: MachineMaterials): PioneerResult {
  const root = new Group();
  const body = new Group();
  root.add(body);

  // 1. High-gain parabolic antenna dish — the dominant feature, facing +x
  const dishMat = new MeshStandardMaterial({ color: 0xd8d4cc, metalness: 0.35, roughness: 0.55 });
  const dishMesh = part(body, new CylinderGeometry(DISH_RADIUS, DISH_RADIUS, 0.04, 32), dishMat, 0, 0, 0);
  dishMesh.rotation.z = Math.PI / 2;
  // Slight concave look: a smaller disc behind the face
  const backDisc = part(body, new CylinderGeometry(DISH_RADIUS * 0.85, DISH_RADIUS * 0.85, 0.03, 32), mats.alu, -0.06, 0, 0);
  backDisc.rotation.z = Math.PI / 2;

  // Feed horn support struts (3 struts from dish rim to feed)
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3 + Math.PI / 6;
    const ey = Math.cos(angle) * DISH_RADIUS * 0.85;
    const ez = Math.sin(angle) * DISH_RADIUS * 0.85;
    tube(body, new Vector3(0, ey, ez), new Vector3(0.55, 0, 0), 0.012, mats.alu);
  }
  // Feed horn at focus
  part(body, new CylinderGeometry(0.06, 0.08, 0.12, 12), mats.dark, 0.55, 0, 0).rotation.z = Math.PI / 2;
  // Medium-gain antenna near feed
  part(body, new CylinderGeometry(0.18, 0.18, 0.012, 16), mats.alu, 0.48, 0, 0).rotation.z = Math.PI / 2;

  // 2. Equipment compartment — hexagonal body behind dish
  const equipMesh = part(body, new CylinderGeometry(BODY_RADIUS, BODY_RADIUS, BODY_DEPTH, 6), mats.gold, -0.32, 0, 0);
  equipMesh.rotation.z = Math.PI / 2;
  // Thermal blankets/louvers
  part(body, new BoxGeometry(BODY_DEPTH * 0.7, 0.02, BODY_RADIUS * 1.4), mats.gold, -0.32, BODY_RADIUS + 0.01, 0);
  part(body, new BoxGeometry(BODY_DEPTH * 0.7, 0.02, BODY_RADIUS * 1.4), mats.gold, -0.32, -(BODY_RADIUS + 0.01), 0);

  // 3. RTG booms (deployable groups)
  const boomA = new Group();
  boomA.position.set(-0.32, 0, BODY_RADIUS + 0.03);
  body.add(boomA);
  tube(boomA, new Vector3(0, 0, 0), new Vector3(0, 0, BOOM_LENGTH), 0.015, mats.dark);
  part(boomA, new CylinderGeometry(RTG_RADIUS, RTG_RADIUS, RTG_LENGTH, 12), mats.dark, 0, 0, BOOM_LENGTH * 0.68);
  part(boomA, new CylinderGeometry(RTG_RADIUS, RTG_RADIUS, RTG_LENGTH, 12), mats.dark, 0, 0, BOOM_LENGTH * 0.88);
  // heat radiator fins on RTGs
  for (const zf of [BOOM_LENGTH * 0.68, BOOM_LENGTH * 0.88]) {
    for (let f = 0; f < 4; f++) {
      const fin = part(boomA, new BoxGeometry(0.002, RTG_RADIUS * 1.6, RTG_LENGTH * 0.8), mats.dark, 0, 0, zf);
      fin.rotation.z = (f / 4) * Math.PI;
    }
  }

  const boomB = new Group();
  boomB.position.set(-0.32, 0, -(BODY_RADIUS + 0.03));
  body.add(boomB);
  tube(boomB, new Vector3(0, 0, 0), new Vector3(0, 0, -BOOM_LENGTH), 0.015, mats.dark);
  part(boomB, new CylinderGeometry(RTG_RADIUS, RTG_RADIUS, RTG_LENGTH, 12), mats.dark, 0, 0, -BOOM_LENGTH * 0.68);
  part(boomB, new CylinderGeometry(RTG_RADIUS, RTG_RADIUS, RTG_LENGTH, 12), mats.dark, 0, 0, -BOOM_LENGTH * 0.88);
  for (const zf of [-BOOM_LENGTH * 0.68, -BOOM_LENGTH * 0.88]) {
    for (let f = 0; f < 4; f++) {
      const fin = part(boomB, new BoxGeometry(0.002, RTG_RADIUS * 1.6, RTG_LENGTH * 0.8), mats.dark, 0, 0, zf);
      fin.rotation.z = (f / 4) * Math.PI;
    }
  }

  // 4. Magnetometer boom (separate, thinner, +y direction)
  const magBoom = new Group();
  magBoom.position.set(-0.32, BODY_RADIUS + 0.03, 0);
  body.add(magBoom);
  tube(magBoom, new Vector3(0, 0, 0), new Vector3(0, MAG_BOOM_LENGTH, 0), 0.006, mats.alu);
  part(magBoom, new SphereGeometry(0.035, 8, 8), mats.white, 0, MAG_BOOM_LENGTH, 0);

  // 5. Low-gain / omnidirectional antenna (rear)
  tube(body, new Vector3(-0.52, 0, 0), new Vector3(-0.88, 0, 0), 0.006, mats.dark);
  part(body, new SphereGeometry(0.025, 8, 8), mats.alu, -0.88, 0, 0);

  // 6. Hydrazine thruster clusters
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI * 2) / 4 + Math.PI / 4;
    const ty = Math.cos(angle) * (BODY_RADIUS + 0.05);
    const tz = Math.sin(angle) * (BODY_RADIUS + 0.05);
    const thr = part(body, new CylinderGeometry(0.018, 0.025, 0.05, 6), mats.alu, -0.42, ty, tz);
    thr.rotation.z = Math.PI / 2;
  }

  // 7. Pioneer plaque (small gold plate on the body)
  const plaqueMesh = part(body, new BoxGeometry(0.15, 0.09, 0.003), mats.gold, -0.15, -(BODY_RADIUS + 0.005), 0.12);
  plaqueMesh.castShadow = false;

  // 8. Sun and star sensors (small details)
  part(body, new CylinderGeometry(0.015, 0.015, 0.04, 8), mats.dark, -0.1, BODY_RADIUS + 0.02, 0.18);
  part(body, new CylinderGeometry(0.015, 0.015, 0.04, 8), mats.dark, -0.1, BODY_RADIUS + 0.02, -0.18);

  // Lamp (for eye glow and speech bubble)
  const lamp = new PointLight(0xffd29a, 0, 8, 2);
  lamp.position.set(0.6, 0, 0);
  body.add(lamp);

  return {
    parts: { root, body, bubbleHeight: 1.8, lamp },
    boomA,
    boomB,
    magBoom,
  };
}

// ---------- Jupiter ----------
function buildJupiterGroup(anisotropy: number): Group {
  const group = new Group();
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const c = canvas.getContext('2d')!;
  const bands = [
    '#c4a882', '#d9c4a0', '#b38e65', '#cbb08a',
    '#e8c99a', '#c4856a', '#d4a882', '#b89070',
    '#c4a882', '#d2b898', '#a88060', '#c9ad7d',
  ];
  const bh = canvas.height / bands.length;
  for (let i = 0; i < bands.length; i++) {
    c.fillStyle = bands[i];
    c.fillRect(0, i * bh, canvas.width, bh + 1);
  }
  // Great Red Spot
  c.fillStyle = '#c06040';
  c.beginPath();
  c.ellipse(180, 72, 18, 10, 0, 0, Math.PI * 2);
  c.fill();
  const tex = new CanvasTexture(canvas);
  tex.anisotropy = anisotropy;
  const jupiter = new Mesh(
    new SphereGeometry(5, 32, 24),
    new MeshStandardMaterial({ map: tex, roughness: 0.85, metalness: 0 }),
  );
  jupiter.castShadow = false;
  group.add(jupiter);
  return group;
}

// ---------- Saturn ----------
function buildSaturnGroup(): Group {
  const group = new Group();
  const saturn = new Mesh(
    new SphereGeometry(4, 32, 24),
    new MeshStandardMaterial({ color: 0xc4b896, roughness: 0.8, metalness: 0 }),
  );
  saturn.castShadow = false;
  group.add(saturn);
  // Main rings (A, B, C rings)
  const ringGeo = new RingGeometry(5.2, 8, 64);
  // Rotate UVs so the ring texture maps radially
  const uv = ringGeo.attributes.uv;
  const pos = ringGeo.attributes.position;
  for (let i = 0; i < uv.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.sqrt(x * x + z * z);
    uv.setXY(i, (r - 5.2) / (8 - 5.2), 0.5);
  }
  const ringMat = new MeshStandardMaterial({
    color: 0xd8c8a0,
    side: DoubleSide,
    transparent: true,
    opacity: 0.75,
    roughness: 0.7,
    metalness: 0.1,
  });
  const ring = new Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.receiveShadow = false;
  ring.castShadow = false;
  group.add(ring);
  // F ring (thin, faint — the discovery)
  const fRingGeo = new RingGeometry(8.3, 8.5, 64);
  const fRing = new Mesh(
    fRingGeo,
    new MeshStandardMaterial({ color: 0xe8d8b0, side: DoubleSide, transparent: true, opacity: 0.35 }),
  );
  fRing.rotation.x = Math.PI / 2;
  fRing.name = 'fRing';
  group.add(fRing);
  return group;
}

// ---------- Sparse asteroids ----------
function buildAsteroids(count: number): Group {
  const group = new Group();
  const mat = new MeshStandardMaterial({ color: 0x6a5a4a, roughness: 0.9 });
  for (let i = 0; i < count; i++) {
    const r = 0.1 + hash(i, 500) * 0.35;
    const asteroid = new Mesh(new IcosahedronGeometry(r, 0), mat);
    // Spread very wide — the real belt is mostly empty
    asteroid.position.set(
      (hash(i, 501) - 0.5) * 80,
      (hash(i, 503) - 0.5) * 20,
      (hash(i, 505) - 0.5) * 80,
    );
    asteroid.rotation.set(hash(i, 507) * 6, hash(i, 509) * 6, hash(i, 511) * 6);
    asteroid.castShadow = false;
    group.add(asteroid);
  }
  return group;
}

// ---------- Earth (small, in background) ----------
function buildEarth(): Mesh {
  return new Mesh(
    new SphereGeometry(0.6, 24, 16),
    new MeshStandardMaterial({ color: 0x4488cc, roughness: 0.7, metalness: 0 }),
  );
}

// ---------- Plaque close-up ----------
function buildPlaqueDetail(): Group {
  const group = new Group();
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const c = canvas.getContext('2d')!;
  // Gold background
  c.fillStyle = '#c79a2c';
  c.fillRect(0, 0, 512, 320);
  // Simple line-art approximation of the Pioneer plaque
  c.strokeStyle = '#1a1200';
  c.lineWidth = 2;
  // Hydrogen atom diagram (top left)
  c.beginPath();
  c.arc(60, 40, 8, 0, Math.PI * 2);
  c.moveTo(80, 40);
  c.arc(80, 40, 8, 0, Math.PI * 2);
  c.moveTo(68, 32);
  c.lineTo(68, 48);
  c.stroke();
  c.font = '12px monospace';
  c.fillStyle = '#1a1200';
  c.fillText('H', 65, 65);
  // Pulsar map (left center)
  c.beginPath();
  for (let i = 0; i < 15; i++) {
    const px = 40 + hash(i, 600) * 140;
    const py = 80 + hash(i, 602) * 120;
    c.moveTo(px, py);
    c.lineTo(100, 160);
  }
  c.stroke();
  // Solar system (bottom)
  c.beginPath();
  const sunX = 30;
  const sunY = 270;
  c.arc(sunX, sunY, 8, 0, Math.PI * 2);
  c.stroke();
  for (let p = 0; p < 9; p++) {
    const cx = sunX + 30 + p * 45;
    c.beginPath();
    c.arc(cx, sunY, 2 + (p === 4 ? 3 : 0), 0, Math.PI * 2);
    c.stroke();
  }
  // Spacecraft path arrow from third planet
  c.beginPath();
  c.moveTo(sunX + 30 + 2 * 45, sunY - 5);
  c.lineTo(sunX + 30 + 4 * 45, sunY - 30);
  c.lineTo(512 - 20, sunY - 40);
  c.stroke();
  // Human figures (right)
  c.beginPath();
  // Man
  c.moveTo(380, 100);
  c.arc(380, 85, 15, 0, Math.PI * 2); // head
  c.moveTo(380, 100);
  c.lineTo(380, 170); // body
  c.moveTo(380, 120);
  c.lineTo(355, 145); // left arm
  c.moveTo(380, 120);
  c.lineTo(405, 135); // right arm (waving)
  c.moveTo(380, 170);
  c.lineTo(360, 215); // left leg
  c.moveTo(380, 170);
  c.lineTo(400, 215); // right leg
  // Woman
  c.moveTo(440, 100);
  c.arc(440, 85, 15, 0, Math.PI * 2);
  c.moveTo(440, 100);
  c.lineTo(440, 170);
  c.moveTo(440, 120);
  c.lineTo(420, 150);
  c.moveTo(440, 120);
  c.lineTo(460, 150);
  c.moveTo(440, 170);
  c.lineTo(420, 215);
  c.moveTo(440, 170);
  c.lineTo(460, 215);
  c.stroke();
  // Spacecraft silhouette (below figures for scale)
  c.strokeRect(350, 225, 130, 8);

  const tex = new CanvasTexture(canvas);
  const plaque = new Mesh(
    new PlaneGeometry(2.5, 1.56),
    new MeshStandardMaterial({ map: tex, metalness: 0.6, roughness: 0.35 }),
  );
  group.add(plaque);
  return group;
}

// ---------- Signal line helper ----------
function buildSignalLine(): Group {
  const group = new Group();
  const dotCount = 20;
  for (let i = 0; i < dotCount; i++) {
    const dot = new Mesh(
      new SphereGeometry(0.03, 6, 4),
      new MeshStandardMaterial({ color: 0x66aaff, emissive: 0x3366aa, emissiveIntensity: 1, transparent: true, opacity: 0.8 }),
    );
    dot.position.set(-2 - i * 1.5, 0.3, -0.5 - i * 0.4);
    dot.castShadow = false;
    group.add(dot);
  }
  return group;
}

// ============================================================
// Main scene builder
// ============================================================
export default async function buildScene({ scene, materials, quality, anisotropy }: SceneBuild): Promise<SceneHandles> {
  const { parts, boomA, boomB, magBoom } = buildPioneer(materials);
  // NASA's model replaces the stand-in when it loads (its booms are fixed, so the deploy is a spin-up)
  const model = await nasaModel('pioneer-10', { size: MODEL_SIZE });
  if (model) {
    parts.body.clear();
    model.position.y = -MODEL_SIZE * DISH_SHARE;
    parts.body.add(model);
  }

  // Fold booms initially (will deploy after launch)
  boomA.rotation.y = -Math.PI / 2;
  boomB.rotation.y = Math.PI / 2;
  magBoom.rotation.z = Math.PI / 2;

  // Planets
  const jupiter = buildJupiterGroup(anisotropy);
  jupiter.visible = false;
  jupiter.position.copy(JUPITER_AT);
  scene.add(jupiter);

  const saturn = buildSaturnGroup();
  saturn.visible = false;
  saturn.position.copy(SATURN_AT);
  saturn.rotation.z = 0.47; // axial tilt
  scene.add(saturn);

  // Asteroids
  const asteroidCount = quality === 'high' ? 40 : 20;
  const asteroids = buildAsteroids(asteroidCount);
  asteroids.visible = false;
  scene.add(asteroids);

  // Earth
  const earth = buildEarth();
  earth.position.set(-8, 1, -4);
  scene.add(earth);

  // Plaque detail
  const plaqueDetail = buildPlaqueDetail();
  plaqueDetail.visible = false;
  plaqueDetail.position.set(0, 0, 0);
  scene.add(plaqueDetail);

  // Signal line
  const signalLine = buildSignalLine();
  signalLine.visible = false;
  scene.add(signalLine);

  // Extra light for deep space (since sky.ts space mode has hard lighting)
  const fill = new PointLight(0xffffff, 0.4, 100);
  fill.position.set(5, 8, 5);
  scene.add(fill);

  const objects: Record<string, import('three').Object3D> = {
    jupiter,
    saturn,
    earth,
    asteroids,
    plaqueDetail,
    signalLine,
  };
  // The F ring is a findable target
  const fRingMesh = saturn.getObjectByName('fRing');
  if (fRingMesh) objects['fRing'] = fRingMesh;

  let ctx: EpisodeContext | null = null;
  let spinning = true;
  let spinRate = 0.3;

  return {
    machine: parts,
    objects,
    onReady(context) {
      ctx = context;
      // In space: no ground, so the machine floats
      context.machine.groundAt = () => 0;
      context.machine.lift = 0.5;
    },
    update(dt, time) {
      if (!ctx) return;
      // Gentle spin (spin-stabilised spacecraft)
      if (spinning) {
        ctx.machine.heading += dt * spinRate;
      }
      // Rotate planets slowly
      if (jupiter.visible) jupiter.rotation.y += dt * 0.02;
      if (saturn.visible) saturn.children[0].rotation.y += dt * 0.015;
      // Pulsing signal dots
      if (signalLine.visible) {
        for (let i = 0; i < signalLine.children.length; i++) {
          const dot = signalLine.children[i] as Mesh;
          const mat = dot.material as MeshStandardMaterial;
          mat.opacity = 0.4 + 0.4 * Math.sin(time * 3 - i * 0.5);
        }
      }
    },
    calls: {
      /** Page 1: initial setup — spacecraft visible with Earth behind */
      reset() {
        parts.root.scale.setScalar(1);
        spinning = true;
        earth.visible = true;
        earth.position.set(-8, 1, -4);
        jupiter.visible = false;
        saturn.visible = false;
        asteroids.visible = false;
        plaqueDetail.visible = false;
        signalLine.visible = false;
        boomA.rotation.y = -Math.PI / 2;
        boomB.rotation.y = Math.PI / 2;
        magBoom.rotation.z = Math.PI / 2;
      },

      /** Page 1 (post-skip): booms out, ready to go */
      readyState() {
        parts.root.scale.setScalar(1);
        earth.visible = true;
        boomA.rotation.y = 0;
        boomB.rotation.y = 0;
        magBoom.rotation.z = 0;
        jupiter.visible = false;
        saturn.visible = false;
        asteroids.visible = false;
        plaqueDetail.visible = false;
        signalLine.visible = false;
      },

      /** Page 2: deploy booms animation */
      async deployBooms(c: EpisodeContext, scope) {
        c.fx.burst('sparkle', new Vector3(0, 0.5, 0));
        // spin up fast, then settle back to the cruise spin
        const spin = { v: 2.4 };
        scope.add(() => (spinRate = 0.3));
        void scope.wait(gsap.to(spin, { v: 0.3, duration: 3, onUpdate: () => void (spinRate = spin.v) }));
        gsap.to(boomA.rotation, { y: 0, duration: 1.5, ease: 'power2.out' });
        gsap.to(boomB.rotation, { y: 0, duration: 1.5, ease: 'power2.out', delay: 0.3 });
        await scope.wait(
          gsap.to(magBoom.rotation, { z: 0, duration: 2, ease: 'power2.out', delay: 0.6 }),
        );
      },

      /** Page 3: show asteroids */
      showBelt() {
        parts.root.scale.setScalar(1);
        earth.visible = false;
        asteroids.visible = true;
        jupiter.visible = false;
        saturn.visible = false;
        signalLine.visible = false;
        plaqueDetail.visible = false;
        boomA.rotation.y = 0;
        boomB.rotation.y = 0;
        magBoom.rotation.z = 0;
      },

      /** Page 4: show Jupiter */
      showJupiter() {
        jupiter.position.copy(JUPITER_AT);
        parts.root.scale.setScalar(1);
        asteroids.visible = false;
        jupiter.visible = true;
        saturn.visible = false;
        signalLine.visible = false;
        earth.visible = false;
        plaqueDetail.visible = false;
        boomA.rotation.y = 0;
        boomB.rotation.y = 0;
        magBoom.rotation.z = 0;
      },

      /** Page 5: show Saturn */
      showSaturn() {
        saturn.position.copy(SATURN_AT);
        parts.root.scale.setScalar(1);
        jupiter.visible = false;
        saturn.visible = true;
        asteroids.visible = false;
        earth.visible = false;
        signalLine.visible = false;
        plaqueDetail.visible = false;
        boomA.rotation.y = 0;
        boomB.rotation.y = 0;
        magBoom.rotation.z = 0;
      },

      /** Page 6: pull back to solar system overview */
      showSolarSystem() {
        jupiter.visible = true;
        saturn.visible = true;
        earth.visible = true;
        asteroids.visible = false;
        signalLine.visible = false;
        plaqueDetail.visible = false;
        parts.root.scale.setScalar(0.12);
        // Scale down for overview
        earth.position.set(-3, 0, 0);
        jupiter.position.set(15, 0, -3);
        saturn.position.set(28, 0, 5);
        boomA.rotation.y = 0;
        boomB.rotation.y = 0;
        magBoom.rotation.z = 0;
      },

      /** Page 7: show signal fading */
      showSignalFade() {
        parts.root.scale.setScalar(1);
        signalLine.visible = true;
        jupiter.visible = false;
        saturn.visible = false;
        asteroids.visible = false;
        earth.visible = true;
        earth.position.set(-20, 0, -8);
        plaqueDetail.visible = false;
        boomA.rotation.y = 0;
        boomB.rotation.y = 0;
        magBoom.rotation.z = 0;
      },

      /** Page 7: animate signal dimming */
      async fadeSignal(_context: EpisodeContext, scope) {
        for (const dot of signalLine.children) {
          const mat = (dot as Mesh).material as MeshStandardMaterial;
          await scope.wait(
            gsap.to(mat, { opacity: 0, duration: 0.3 }),
          );
        }
      },

      /** Page 8: plaque close-up */
      showPlaque() {
        parts.root.scale.setScalar(1);
        spinning = false;
        plaqueDetail.visible = true;
        plaqueDetail.position.set(0, 0, PLAQUE_Z);
        signalLine.visible = false;
        jupiter.visible = false;
        saturn.visible = false;
        asteroids.visible = false;
        earth.visible = false;
      },

      /** Page 9: pull back */
      pullBack() {
        parts.root.scale.setScalar(1);
        spinning = true;
        plaqueDetail.visible = false;
        signalLine.visible = false;
        jupiter.visible = false;
        saturn.visible = false;
        asteroids.visible = false;
        earth.visible = false;
      },
    },
  };
}
