/**
 * InSight's scene on Elysium Planitia, Mars.
 * Shows the stationary lander, its deployed seismometer dome (SEIS),
 * the HP3 Mole casing, and atmospheric dust effects.
 */
import {
  CylinderGeometry,
  Group,
  SphereGeometry,
  Vector3,
} from 'three';
import gsap from 'gsap';
import { part, tube, type MachineMaterials } from '../../engine/models';
import type { EpisodeContext, SceneBuild, SceneHandles } from '../../engine/types';

/** Build SEIS dome: golden hexagonal/spherical protective shield */
function buildSeisShield(mats: MachineMaterials): Group {
  const group = new Group();
  // Domed wind & thermal shield
  const domeMat = mats.gold.clone();
  domeMat.roughness = 0.3;
  const dome = part(group, new SphereGeometry(0.32, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), domeMat, 0, 0, 0);
  dome.scale.set(1, 0.75, 1);
  // Base ring skirt
  part(group, new CylinderGeometry(0.33, 0.36, 0.04, 16), mats.fabric, 0, 0.02, 0);
  // Aerodynamic grab handle on top for robotic arm grapple
  part(group, new CylinderGeometry(0.015, 0.015, 0.06, 8), mats.alu, 0, 0.27, 0);
  part(group, new SphereGeometry(0.025, 8, 8), mats.alu, 0, 0.3, 0);
  return group;
}

/** Build HP3 Mole assembly on the surface */
function buildMole(mats: MachineMaterials): Group {
  const group = new Group();
  // Support structure
  part(group, new CylinderGeometry(0.06, 0.07, 0.28, 8), mats.dark, 0, 0.14, 0);
  // Small probe tether
  tube(group, new Vector3(0, 0.28, 0), new Vector3(0.12, 0.05, 0), 0.008, mats.dark);
  return group;
}

export default function buildScene({ scene, world, materials }: SceneBuild): SceneHandles {
  const seis = buildSeisShield(materials);
  const mole = buildMole(materials);

  // Position on surface in front of lander arm reach
  const seisPos = { x: 1.5, z: 0.8 };
  const molePos = { x: 1.4, z: -0.9 };

  seis.position.set(seisPos.x, world.heightAt(seisPos.x, seisPos.z), seisPos.z);
  mole.position.set(molePos.x, world.heightAt(molePos.x, molePos.z), molePos.z);

  seis.visible = false;
  mole.visible = false;

  scene.add(seis, mole);

  const objects: Record<string, import('three').Object3D> = {
    seis,
    mole,
  };

  let ctx: EpisodeContext | null = null;

  return {
    objects,
    onReady(context) {
      ctx = context;
    },
    calls: {
      arrive() {
        seis.visible = false;
        mole.visible = false;
      },
      async deployInstruments(context: EpisodeContext, scope) {
        seis.visible = true;
        mole.visible = true;
        seis.position.y += 0.8;
        mole.position.y += 0.5;
        context.fx.burst('dustBurst', seis.position);
        context.audio.play('thud');
        await scope.wait(
          gsap.to(seis.position, {
            y: world.heightAt(seisPos.x, seisPos.z),
            duration: 1.5,
            ease: 'bounce.out',
          }),
        );
        await scope.wait(
          gsap.to(mole.position, {
            y: world.heightAt(molePos.x, molePos.z),
            duration: 1.2,
            ease: 'power2.out',
          }),
        );
      },
      ready() {
        seis.visible = true;
        mole.visible = true;
        seis.position.y = world.heightAt(seisPos.x, seisPos.z);
        mole.position.y = world.heightAt(molePos.x, molePos.z);
      },
      quake(context: EpisodeContext) {
        if (!ctx) return;
        context.fx.burst('dustPuff', seis.position);
        context.audio.play('thud');
      },
    },
  };
}
