import type { BaseGameConfig, MiniGame } from '../../../engine/play';
import { APOLLO_11 } from '../storyData';

type DeployConfig = BaseGameConfig;

const deploy: MiniGame<DeployConfig> = ({ ctx, scope, hud }) =>
  new Promise<void>((win) => {
    const distanceId = 'apollo-deploy-distance';
    const headingId = 'apollo-deploy-heading';
    const distanceLabel = scope.el('label', 'apollo-deploy-control', hud.panel, ctx.t('deploy.distance'));
    distanceLabel.htmlFor = distanceId;
    const distance = scope.el('input', 'apollo-deploy-range', distanceLabel);
    distance.id = distanceId;
    distance.type = 'range';
    distance.min = String(APOLLO_11.easep.minDeploymentDistanceM);
    distance.max = String(APOLLO_11.easep.maxDeploymentDistanceM);
    distance.step = '1';
    distance.value = String(APOLLO_11.easep.minDeploymentDistanceM);
    distance.setAttribute('aria-valuetext', ctx.t('deploy.distanceValue', { value: distance.value }));

    const headingLabel = scope.el('label', 'apollo-deploy-control', hud.panel, ctx.t('deploy.heading'));
    headingLabel.htmlFor = headingId;
    const heading = scope.el('input', 'apollo-deploy-range', headingLabel);
    heading.id = headingId;
    heading.type = 'range';
    heading.min = '0';
    heading.max = '180';
    heading.step = '1';
    heading.value = '0';
    heading.setAttribute('aria-valuetext', ctx.t('deploy.headingValue', { value: heading.value }));

    let distanceReady = false;
    let headingReady = false;
    const update = (): void => {
      const distanceM = Number(distance.value);
      const headingDeg = Number(heading.value);
      distanceReady =
        Math.abs(distanceM - APOLLO_11.easep.deploymentDistanceM) <= APOLLO_11.easep.deploymentToleranceM;
      headingReady =
        Math.abs(headingDeg - APOLLO_11.easep.panelHeadingDeg) <= APOLLO_11.easep.panelAlignmentToleranceDeg;
      ctx.machine.place(0, APOLLO_11.lander.z + distanceM, (headingDeg * Math.PI) / 180);
      distance.setAttribute('aria-valuetext', ctx.t('deploy.distanceValue', { value: distance.value }));
      heading.setAttribute('aria-valuetext', ctx.t('deploy.headingValue', { value: heading.value }));
      hud.status(ctx.t('deploy.status', { distance: distance.value, heading: heading.value }));
      hud.progress((Number(distanceReady) + Number(headingReady)) / 2);
    };

    scope.listen(distance, 'input', update);
    scope.listen(heading, 'input', update);
    hud.button(ctx.t('deploy.confirm'), () => {
      if (!distanceReady) {
        hud.fail('ui.sfx.oops', 'deploy.retryDistance');
        return;
      }
      if (!headingReady) {
        hud.fail('ui.sfx.oops', 'deploy.retryHeading');
        return;
      }
      hud.hintDone();
      hud.progress(1);
      win();
    });
    update();
  });

export default deploy;
