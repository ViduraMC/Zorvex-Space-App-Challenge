/**
 * Land Viking 1: press each step of the real landing sequence, in order, at the right time.
 * The numbers are NASA's (NSSDCA Viking 1 Lander): parachute at 6 km and about 250 m/s,
 * slowed to 60 m/s, then the aeroshell is dropped, the legs come out, and three engines land it.
 * The fall itself is squeezed into a few seconds.
 */
import type { Mesh, MeshStandardMaterial, Object3D } from 'three';
import type { BaseGameConfig, MiniGame } from '../../../engine/play';

type Step = 'chute' | 'shield' | 'engines';

const START_KM = 20;
const CHUTE_KM = 6;
const CHUTE_WINDOW_KM = 1.4;
/** Display speed (m/s): NASA's 250 at parachute opening, 60 after it slowed the lander. */
const CHUTE_SPEED = 250;
const SLOW_SPEED = 60;
const FREE_FALL_KM_S = 2.6;
const CHUTE_KM_S = 0.55;
const ENGINE_KM_S = 0.45;
/** Visual height of the lander per km of (displayed) altitude. */
const METRES_PER_KM = 6;
const SLOW_DOWN_S = 4.5;

const descent: MiniGame<BaseGameConfig> = ({ ctx, scope, hud }) => {
  const { machine, t, audio, comic, fx, objects, director } = ctx;
  const shell = objects.aeroshell as Object3D;
  const chute = objects.parachute as Object3D;
  const engines = objects.engines as Object3D;
  const heatShield = shell.userData.heatShield as MeshStandardMaterial;

  let km = START_KM;
  let speed = 0;
  let phase: 'falling' | 'chute' | 'slowed' | 'legs' | 'engines' | 'done' = 'falling';
  let chuteTime = 0;

  // the button row runs right to left, so the last step is created first: it reads Parachute, Shield, Engines
  const engineButton = hud.button(t('game.descent.engines'), () => press('engines'));
  const shieldButton = hud.button(t('game.descent.shield'), () => press('shield'));
  const chuteButton = hud.button(t('game.descent.chute'), () => press('chute'));
  const buttons: Record<Step, HTMLButtonElement> = { chute: chuteButton, shield: shieldButton, engines: engineButton };

  scope.add(() => audio.rocket(0));
  const reset = (): void => {
    audio.rocket(0);
    km = START_KM;
    speed = 0;
    phase = 'falling';
    shell.visible = true;
    shell.position.y = 0.55;
    chute.visible = false;
    engines.visible = false;
    for (const b of Object.values(buttons)) b.disabled = false;
  };
  reset();

  function press(step: Step): void {
    hud.hintDone();
    if (step === 'chute') {
      if (phase !== 'falling') return;
      const off = km - CHUTE_KM;
      if (Math.abs(off) > CHUTE_WINDOW_KM) {
        hud.fail('sfx.whoops', off > 0 ? 'game.descent.early' : 'game.descent.late');
        reset();
        return;
      }
      phase = 'chute';
      chuteTime = 0;
      speed = CHUTE_SPEED;
      chute.visible = true;
      chute.scale.set(0.2, 0.2, 0.2);
      audio.play('chute');
      comic.sfx(t('sfx.chute'));
      buttons.chute.disabled = true;
      return;
    }
    if (step === 'shield') {
      if (phase === 'falling') return void hud.fail('sfx.whoops', 'game.descent.chuteFirst');
      if (phase === 'chute') return void hud.toast(t('game.descent.wait60'), 'oops');
      if (phase !== 'slowed') return;
      phase = 'legs';
      buttons.shield.disabled = true;
      audio.play('thud');
      comic.sfx(t('sfx.shield'));
      return;
    }
    if (phase === 'falling' || phase === 'chute') return void hud.fail('sfx.whoops', 'game.descent.chuteFirst');
    if (phase === 'slowed') return void hud.toast(t('game.descent.shieldFirst'), 'oops');
    if (phase !== 'legs') return;
    phase = 'engines';
    chute.visible = false;
    engines.visible = true;
    buttons.engines.disabled = true;
    audio.play('ignition');
    audio.rocket(0.6);
    comic.sfx(t('sfx.engines'));
  }

  return new Promise<void>((win) => {
    scope.frame((dt, time) => {
      if (phase === 'done') return;
      if (phase === 'falling') {
        km = Math.max(0, km - FREE_FALL_KM_S * dt);
        // the heat shield glows while the air is fast and hot around it
        heatShield.emissiveIntensity = Math.max(0, (km - 8) / 12) * 2.5;
        if (km <= CHUTE_KM - CHUTE_WINDOW_KM) {
          hud.fail('sfx.whoops', 'game.descent.late');
          reset();
          return;
        }
      } else {
        heatShield.emissiveIntensity = 0;
        const rate = phase === 'engines' ? ENGINE_KM_S : CHUTE_KM_S;
        km = Math.max(0, km - rate * dt);
        if (phase === 'chute' || phase === 'slowed' || phase === 'legs') {
          chuteTime += dt;
          chute.scale.setScalar(Math.min(1, 0.2 + chuteTime * 1.6));
          speed = Math.max(SLOW_SPEED, CHUTE_SPEED - ((CHUTE_SPEED - SLOW_SPEED) * chuteTime) / SLOW_DOWN_S);
          if (phase === 'chute' && speed <= SLOW_SPEED) {
            phase = 'slowed';
            hud.toast(t('game.descent.at60'));
          }
        }
        if (phase === 'legs' && shell.position.y > -30) shell.position.y -= dt * 22; // the aeroshell falls away
        if (phase === 'engines') {
          for (const f of engines.children as Mesh[]) f.scale.y = 1 + Math.sin(time * 50 + f.id) * 0.2;
          speed = Math.max(2, speed - dt * 40);
        }
        if (km <= 0) {
          if (phase !== 'engines') {
            hud.fail('sfx.bump', 'game.descent.noEngines');
            reset();
            return;
          }
          phase = 'done';
          machine.lift = 0;
          engines.visible = false;
          audio.rocket(0);
          fx.burst('dustBurst', ctx.resolve('machine'));
          audio.play('thud');
          comic.sfx(t('sfx.touchdown'));
          win();
          return;
        }
      }
      machine.lift = km * METRES_PER_KM;
      const y = machine.lift;
      // pull back while the parachute is open so its canopy is in the picture
      const wide = chute.visible ? 1 : 0;
      director.shot({
        pos: [machine.x + 9 + wide * 6, y + 3.5 + wide * 6, machine.z + 12 + wide * 10],
        look: [machine.x, y + 1.2 + wide * 7, machine.z],
      });
      hud.status(
        speed > 0
          ? t('game.descent.readoutSpeed', { km: km.toFixed(1), speed: Math.round(speed) })
          : t('game.descent.readout', { km: km.toFixed(1) }),
      );
      hud.progress(1 - km / START_KM);
    });
  });
};

export default descent;
