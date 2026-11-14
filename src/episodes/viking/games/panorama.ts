/**
 * Stand where Viking stood: a real Viking 1 panorama of Chryse Planitia (NASA/JPL) wrapped around
 * the child. Drag to turn; the goal is to look all the way around, like the lander's scanning
 * cameras did. The picture is shown as NASA published it (black and white).
 */
import { CylinderGeometry, DoubleSide, Mesh, MeshBasicMaterial, SRGBColorSpace, TextureLoader } from 'three';
import type { BaseGameConfig, MiniGame } from '../../../engine/play';
import panoramaUrl from '../assets/chryse-panorama.jpg';

const RADIUS = 10;
/** Image width / height of chryse-panorama.jpg (2497 x 512). */
const ASPECT = 2497 / 512;
const HEIGHT = (2 * Math.PI * RADIUS) / ASPECT;
/** Lift the viewer far above the 3D ground so only the photo is around them. */
const LIFT = 400;
const DRAG_SPEED = 0.006;
const FULL_TURN = Math.PI * 2 * 0.92;
const PANORAMA_FOV = 68;

const panorama: MiniGame<BaseGameConfig> = ({ ctx, scope, hud }) => {
  const { t, audio, comic, director, canvas } = ctx;
  const texture = new TextureLoader().load(panoramaUrl);
  texture.colorSpace = SRGBColorSpace;
  const wall = new Mesh(
    new CylinderGeometry(RADIUS, RADIUS, HEIGHT, 96, 1, true),
    new MeshBasicMaterial({ map: texture, side: DoubleSide, fog: false }),
  );
  // seen from inside, so flip it to read left to right
  wall.scale.x = -1;
  wall.position.set(0, LIFT, 0);
  ctx.scene.add(wall);
  scope.add(() => {
    ctx.scene.remove(wall);
    wall.geometry.dispose();
    wall.material.dispose();
    texture.dispose();
  });
  scope.el('div', 'g-pan-credit', comic.gameHost, t('img.pan.credit'));
  // a wider lens shows more of the picture at once, less magnified
  const camera = ctx.camera;
  const fovBefore = camera.fov;
  camera.fov = PANORAMA_FOV;
  camera.updateProjectionMatrix();
  scope.add(() => {
    camera.fov = fovBefore;
    camera.updateProjectionMatrix();
  });

  let yaw = 0;
  let turned = 0;
  let last: number | null = null;
  let spin = 0.15; // a gentle start so the child sees it is a full circle
  scope.listen(canvas, 'pointerdown', (e: PointerEvent) => {
    last = e.clientX;
    spin = 0;
    canvas.setPointerCapture(e.pointerId);
  });
  scope.listen(canvas, 'pointermove', (e: PointerEvent) => {
    if (last == null) return;
    const delta = (e.clientX - last) * DRAG_SPEED;
    last = e.clientX;
    yaw -= delta;
    turned += Math.abs(delta);
    hud.hintDone();
  });
  for (const type of ['pointerup', 'pointercancel']) scope.listen(canvas, type, () => (last = null));
  scope.listen(window, 'keydown', (e: KeyboardEvent) => {
    const step = e.key === 'ArrowLeft' ? -0.15 : e.key === 'ArrowRight' ? 0.15 : 0;
    if (!step) return;
    yaw += step;
    turned += Math.abs(step);
    spin = 0;
    hud.hintDone();
  });

  return new Promise<void>((win) => {
    let done = false;
    scope.frame((dt) => {
      yaw += spin * dt;
      director.shot({ pos: [0, LIFT, 0], look: [Math.sin(yaw) * 5, LIFT - 0.4, -Math.cos(yaw) * 5] });
      const share = Math.min(1, turned / FULL_TURN);
      hud.progress(share);
      hud.status(t('game.pan.turned', { n: Math.round(share * 360) }));
      if (!done && share >= 1) {
        done = true;
        audio.play('ping');
        win();
      }
    });
  });
};

export default panorama;
