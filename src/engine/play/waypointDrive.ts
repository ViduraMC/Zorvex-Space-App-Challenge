/**
 * waypointDrive: plan a path, SEND it, wait for the signal to cross space, then watch the
 * vehicle follow the plan. Teaches why far-away rovers cannot be steered with a joystick.
 * Real numbers in play: the signal delay and the waypoint limit.
 */
import type { Vector3 } from 'three';
import type { Target } from '../types';
import { distance2d, segmentCircleHit } from './geometry';
import { groundPoint, groundRing, onTap, pin, tween, type BaseGameConfig, type MiniGame } from './kit';

export interface WaypointDriveConfig extends BaseGameConfig {
  goalAt: Target;
  goalRadius: number;
  /** Things the path must not cross. */
  obstacles?: { at: Target; radius: number }[];
  maxWaypoints: number;
  /** The real one-way signal time in minutes (shown to the child). */
  delayMinutes: number;
  /** How long the child really waits (the delay "squeezed", and labelled as such). */
  delaySeconds: number;
  msPerMetre: number;
  /** Sound-effect word when the vehicle hits an obstacle (default "ui.sfx.bonk"). */
  bonkSfx?: string;
}

const GOAL_COLOR = 0xffd84a;
const DANGER_COLOR = 0xe8402a;
const SVG_NS = 'http://www.w3.org/2000/svg';

export const waypointDrive: MiniGame<WaypointDriveConfig> = async (api, cfg) => {
  const { ctx, scope, hud } = api;
  const { machine, t, audio, comic } = ctx;
  const start = { x: machine.x, z: machine.z, heading: machine.heading };
  const goal = ctx.resolve(cfg.goalAt).clone();
  groundRing(api, goal, cfg.goalRadius, GOAL_COLOR);
  const obstacles = (cfg.obstacles ?? []).map((o) => ({ at: ctx.resolve(o.at).clone(), radius: o.radius }));
  for (const o of obstacles) groundRing(api, o.at, o.radius, DANGER_COLOR);

  // the planned path is drawn as a thick dashed line over the scene
  const svg = document.createElementNS(SVG_NS, 'svg');
  const line = document.createElementNS(SVG_NS, 'polyline');
  svg.setAttribute('class', 'g-path');
  svg.appendChild(line);
  ctx.comic.gameHost.appendChild(svg);
  scope.add(() => svg.remove());

  let waypoints: Vector3[] = [];
  let planning = true;
  let dots = scope.child();
  const here = ctx.resolve('machine').clone();

  scope.frame(() => {
    here.set(machine.x, machine.root.position.y + 0.05, machine.z);
    const pts = [here, ...waypoints].map((p) => ctx.project(p)).map((s) => `${s.x.toFixed(1)},${s.y.toFixed(1)}`);
    line.setAttribute('points', pts.join(' '));
  });

  const send = hud.button(t('ui.play.waypoint.send'), () => void run(), 'btn');
  const undo = hud.button(t('ui.play.waypoint.undo'), () => {
    waypoints.pop();
    redraw();
  });

  const redraw = (): void => {
    dots.dispose();
    dots = scope.child();
    waypoints.forEach((p, i) => {
      const dot = dots.el('div', 'g-dot', comic.pinHost, String(i + 1));
      pin({ ...api, scope: dots }, dot, () => p);
    });
    send.disabled = waypoints.length === 0 || !planning;
    undo.disabled = waypoints.length === 0 || !planning;
    hud.status(t('ui.play.waypoint.left', { n: cfg.maxWaypoints - waypoints.length }));
  };
  redraw();

  onTap(api, (x, y) => {
    if (!planning) return;
    const p = groundPoint(ctx, x, y);
    if (!p) return;
    if (waypoints.length >= cfg.maxWaypoints) {
      hud.toast(t('ui.play.waypoint.full'), 'oops');
      return;
    }
    // a tap near the goal snaps onto it: small fingers, small screens
    if (distance2d(p.x, p.z, goal.x, goal.z) < cfg.goalRadius * 1.6) p.copy(goal);
    p.y = ctx.world.heightAt(p.x, p.z) + 0.05;
    waypoints.push(p);
    audio.play('pop');
    hud.hintDone();
    redraw();
  });

  let won: () => void = () => undefined;

  async function run(): Promise<void> {
    planning = false;
    redraw();
    // 1. the command crosses space: the real delay, squeezed and labelled
    comic.sfx(t('ui.sfx.send'));
    hud.status(t('ui.play.waypoint.flying', { min: cfg.delayMinutes, sec: cfg.delaySeconds }));
    const signal = { p: 0, beeps: 0 };
    await tween(scope, signal, {
      p: 1,
      duration: cfg.delaySeconds,
      ease: 'none',
      onUpdate: () => {
        hud.progress(signal.p);
        if (signal.p * cfg.delaySeconds * 2 > signal.beeps) {
          signal.beeps++;
          audio.play('radio');
        }
      },
    });
    audio.play('beep');
    hud.status(t('ui.play.waypoint.received'));

    // 2. the vehicle follows the plan exactly, even into a rock
    let from = { x: machine.x, z: machine.z };
    let crashed = false;
    while (waypoints.length > 0 && !crashed) {
      const to = waypoints[0];
      let hit: number | null = null;
      for (const o of obstacles) {
        const h = segmentCircleHit(from.x, from.z, to.x, to.z, o.at.x, o.at.z, o.radius);
        if (h != null && (hit == null || h < hit)) hit = h;
      }
      const reach = hit ?? 1;
      const x = from.x + (to.x - from.x) * reach;
      const z = from.z + (to.z - from.z) * reach;
      await scope.wait(machine.driveTo(x, z, Math.max(300, distance2d(from.x, from.z, x, z) * cfg.msPerMetre)));
      crashed = hit != null;
      from = { x, z };
      if (!crashed) waypoints = waypoints.slice(1);
    }

    if (!crashed && distance2d(machine.x, machine.z, goal.x, goal.z) <= cfg.goalRadius) {
      won();
      return;
    }
    // 3. funny fail, then straight back to planning
    if (crashed) {
      ctx.fx.burst('dustPuff', ctx.resolve('machine'));
      hud.fail(cfg.bonkSfx ?? 'ui.sfx.bonk', 'ui.play.waypoint.bonk');
    } else {
      hud.fail('ui.sfx.hmm', 'ui.play.waypoint.short');
    }
    await scope.sleep(900);
    waypoints = [];
    await scope.wait(machine.driveTo(start.x, start.z, 600));
    machine.place(start.x, start.z, start.heading);
    hud.progress(0);
    planning = true;
    redraw();
  }

  return new Promise<void>((resolve) => {
    won = resolve;
  });
};
