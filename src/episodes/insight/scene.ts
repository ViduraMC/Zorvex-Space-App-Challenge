/**
 * InSight on Elysium Planitia: NASA's InSight model, the domed seismometer shield (SEIS) and the
 * heat-probe housing (HP3) that the arm sets on the ground.
 * Calls: arrive (instruments still on the deck), deployInstruments, ready, hammer.
 */
import { CylinderGeometry, Group, SphereGeometry, Vector3 } from 'three';
import gsap from 'gsap';
import { buildPlaceholder, part, partsFromModel, tube, type MachineMaterials } from '../../engine/models';
import type { SceneBuild, SceneHandles } from '../../engine/types';
import { nasaModel } from '../../journey/nasaModels';

/** Largest side of the model (solar panels spread), metres. Drawn a little large for a phone screen. */
const LANDER_SIZE = 5.5;
const SEIS_AT = { x: 2.5, z: 1.9 };
const HP3_AT = { x: 1.5, z: -1.4 };

/** The domed Wind and Thermal Shield that covers SEIS. */
function buildSeisShield(mats: MachineMaterials): Group {
  const group = new Group();
  const domeMat = mats.gold.clone();
  domeMat.roughness = 0.6;
  const dome = part(group, new SphereGeometry(0.36, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), domeMat);
  dome.scale.set(1, 0.75, 1);
  part(group, new CylinderGeometry(0.38, 0.42, 0.05, 24), mats.fabric, 0, 0.025, 0);
  part(group, new SphereGeometry(0.03, 8, 8), mats.alu, 0, 0.3, 0);
  return group;
}

/** HP3: the housing the mole hammers down from, with its tether. */
function buildMole(mats: MachineMaterials): Group {
  const group = new Group();
  part(group, new CylinderGeometry(0.08, 0.09, 0.32, 10), mats.dark, 0, 0.16, 0);
  tube(group, new Vector3(0, 0.3, 0), new Vector3(-0.5, 0.05, 0.1), 0.01, mats.dark);
  return group;
}

export default async function buildScene({ scene, world, materials }: SceneBuild): Promise<SceneHandles> {
  const seis = buildSeisShield(materials);
  const mole = buildMole(materials);
  const ground = (at: { x: number; z: number }): number => world.heightAt(at.x, at.z);
  seis.position.set(SEIS_AT.x, ground(SEIS_AT), SEIS_AT.z);
  mole.position.set(HP3_AT.x, ground(HP3_AT), HP3_AT.z);
  scene.add(seis, mole);

  const model = await nasaModel('insight-lander', { size: LANDER_SIZE });
  const machine = model ? partsFromModel(model, 1, 1.6) : buildPlaceholder(materials);

  const place = (): void => {
    gsap.killTweensOf([seis.position, mole.position]);
    seis.position.y = ground(SEIS_AT);
    mole.position.y = ground(HP3_AT);
  };

  return {
    machine,
    objects: { seis, mole },
    calls: {
      arrive() {
        place();
        seis.visible = false;
        mole.visible = false;
      },
      ready() {
        place();
        seis.visible = true;
        mole.visible = true;
      },
      /** The arm lowers SEIS, then HP3, onto the ground. */
      async deployInstruments(c, scope) {
        seis.visible = true;
        mole.visible = true;
        seis.position.y = ground(SEIS_AT) + 1;
        mole.position.y = ground(HP3_AT) + 0.8;
        await scope.wait(gsap.to(seis.position, { y: ground(SEIS_AT), duration: 1.6, ease: 'power2.inOut' }));
        c.fx.burst('dustPuff', seis.position);
        c.audio.play('thud');
        await scope.wait(gsap.to(mole.position, { y: ground(HP3_AT), duration: 1.2, ease: 'power2.inOut' }));
        c.fx.burst('dustPuff', mole.position);
      },
      /** The mole hammers: each blow jolts the housing and puffs dust, but it gets nowhere. */
      async hammer(c, scope) {
        for (let k = 0; k < 6; k++) {
          c.audio.play('thud');
          if (k % 2 === 0) c.comic.sfx(c.t('sfx.bonk'));
          c.fx.burst('dustPuff', mole.position);
          await scope.wait(gsap.fromTo(mole.position, { y: ground(HP3_AT) + 0.04 }, { y: ground(HP3_AT), duration: 0.45, ease: 'bounce.out' }));
        }
      },
    },
  };
}
