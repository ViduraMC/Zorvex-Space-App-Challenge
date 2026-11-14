/**
 * directDrive: steer a vehicle yourself (touch joystick, arrow keys or WASD) through glowing
 * checkpoints. Gravity is a real number: on the Moon (1.62 m/s²) every bump becomes a long,
 * floaty hop; on Earth (9.81) the same bump barely lifts the wheels.
 */
import { Vector3 } from 'three';
import type { FxName } from '../fx';
import type { Target } from '../types';
import { distance2d } from './geometry';
import { groundRing, type BaseGameConfig, type MiniGame } from './kit';

export interface DirectDriveConfig extends BaseGameConfig {
  checkpoints: Target[];
  /** How close counts as reaching a checkpoint (metres). */
  radius: number;
  /** Top speed in metres per second. */
  speed: number;
  /** Surface gravity in m/s²: Moon 1.62, Mars 3.71, Earth 9.81. */
  gravity: number;
  /** How hard bumps kick the vehicle upward (0 = glued to the ground, 1 = bouncy). */
  bounce: number;
  /** The vehicle is turned back when it strays this far from where it started (metres). */
  bounds: number;
  /** Dust thrown up on landing (default "dustPuff"). */
  landFx?: FxName;
}

const CHECKPOINT_COLOR = 0xffd84a;
const TURN_RATE = 1.9;
const CAMERA_BACK = 3.2;
const CAMERA_UP = 1.3;
const HARD_LANDING = 0.9;
const KEYS: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  w: [0, -1],
  ArrowDown: [0, 1],
  s: [0, 1],
  ArrowLeft: [-1, 0],
  a: [-1, 0],
  ArrowRight: [1, 0],
  d: [1, 0],
};

export const directDrive: MiniGame<DirectDriveConfig> = async (api, cfg) => {
  const { ctx, scope, hud } = api;
  const { machine, t, audio, comic } = ctx;
  machine.stop();
  const start = { x: machine.x, z: machine.z };
  const stick = { x: 0, y: 0 };
  const held = new Set<string>();

  // touch joystick
  const base = scope.el('div', 'g-joy', hud.panel);
  const knob = scope.el('div', 'g-joy-knob', base);
  const moveStick = (e: PointerEvent): void => {
    const r = base.getBoundingClientRect();
    let x = ((e.clientX - r.left) / r.width) * 2 - 1;
    let y = ((e.clientY - r.top) / r.height) * 2 - 1;
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    stick.x = x;
    stick.y = y;
    hud.hintDone();
  };
  scope.listen(base, 'pointerdown', (e) => {
    base.setPointerCapture(e.pointerId);
    moveStick(e);
  });
  scope.listen(base, 'pointermove', (e) => base.hasPointerCapture(e.pointerId) && moveStick(e));
  for (const type of ['pointerup', 'pointercancel']) {
    scope.listen(base, type, () => {
      stick.x = stick.y = 0;
    });
  }
  scope.listen(window, 'keydown', (e: KeyboardEvent) => {
    if (e.key in KEYS) {
      held.add(e.key);
      hud.hintDone();
      e.preventDefault();
    }
  });
  scope.listen(window, 'keyup', (e: KeyboardEvent) => held.delete(e.key));

  const rings = cfg.checkpoints.map((at) => ({ p: ctx.resolve(at).clone(), ring: null as ReturnType<typeof groundRing> | null }));
  for (const r of rings) r.ring = groundRing(api, r.p, cfg.radius, CHECKPOINT_COLOR);
  let reached = 0;
  hud.status(t('ui.play.count', { n: 0, total: rings.length }));

  let altitude = machine.groundAt(machine.x, machine.z);
  let vy = 0;
  let airborne = false;
  const camPos = new Vector3(machine.x - CAMERA_BACK, altitude + CAMERA_UP, machine.z);
  const camWant = new Vector3();
  scope.add(() => {
    machine.lift = 0;
  });

  return new Promise<void>((resolve) => {
    scope.frame((dt) => {
      let sx = stick.x;
      let sy = stick.y;
      for (const key of held) {
        sx += KEYS[key][0];
        sy += KEYS[key][1];
      }
      sx = Math.max(-1, Math.min(1, sx));
      const throttle = Math.max(-0.5, Math.min(1, -sy));

      machine.heading -= sx * TURN_RATE * dt;
      const fx = Math.cos(machine.heading);
      const fz = -Math.sin(machine.heading);
      const groundBefore = machine.groundAt(machine.x, machine.z);
      machine.x += fx * throttle * cfg.speed * dt;
      machine.z += fz * throttle * cfg.speed * dt;
      if (distance2d(machine.x, machine.z, start.x, start.z) > cfg.bounds) {
        // wandered too far: a gentle U-turn instead of a wall
        machine.heading = Math.atan2(machine.z - start.z, start.x - machine.x);
        machine.x -= fx * 0.3;
        machine.z -= fz * 0.3;
        hud.toast(t('ui.play.drive.comeBack'), 'oops');
      }

      // hop physics: the ground kicks the vehicle up, gravity brings it down
      const ground = machine.groundAt(machine.x, machine.z);
      const groundSpeed = (ground - groundBefore) / Math.max(dt, 1e-4);
      vy -= cfg.gravity * dt;
      altitude += vy * dt;
      if (altitude <= ground) {
        if (airborne && vy < -HARD_LANDING) {
          ctx.fx.burst(cfg.landFx ?? 'dustPuff', ctx.resolve('machine'));
          audio.play('thud');
          comic.sfx(t('ui.sfx.bump'));
        }
        altitude = ground;
        vy = Math.max(0, groundSpeed) * (1 + cfg.bounce * 2.5);
        airborne = false;
      } else if (altitude - ground > 0.05) {
        airborne = true;
      }
      machine.lift = altitude - ground;

      // chase camera, eased so hops feel floaty rather than shaky
      camWant.set(machine.x - fx * CAMERA_BACK, altitude + CAMERA_UP, machine.z - fz * CAMERA_BACK);
      camPos.lerp(camWant, Math.min(1, dt * 3));
      void ctx.director.shot({ pos: [camPos.x, camPos.y, camPos.z], look: [machine.x, altitude + 0.3, machine.z] });

      const next = rings[reached];
      if (next && distance2d(machine.x, machine.z, next.p.x, next.p.z) < cfg.radius) {
        if (next.ring) next.ring.visible = false;
        reached++;
        audio.play('ping');
        comic.sfx(t('ui.sfx.found'));
        hud.status(t('ui.play.count', { n: reached, total: rings.length }));
        hud.progress(reached / rings.length);
        if (reached >= rings.length) resolve();
      }
      knob.style.transform = `translate(${stick.x * 34}px, ${stick.y * 34}px)`;
    });
  });
};
