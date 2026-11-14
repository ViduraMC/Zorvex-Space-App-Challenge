import type { BaseGameConfig, MiniGame } from '../../../engine/play';
import { APOLLO_TIMELINE } from '../timelineData';

type TimelineConfig = BaseGameConfig;

const timeline: MiniGame<TimelineConfig> = ({ ctx, scope, hud }) =>
  new Promise<void>((win) => {
    const shell = ctx.canvas.parentElement;
    if (!shell) throw new Error('Apollo timeline needs the episode player shell.');

    const diagram = scope.el('div', 'apollo-timeline-diagram', shell);
    diagram.setAttribute('role', 'img');
    diagram.setAttribute('aria-label', ctx.t('timeline.diagram'));
    const earth = scope.el('span', 'apollo-timeline-diagram__earth', diagram, ctx.t('timeline.earth'));
    const path = scope.el('span', 'apollo-timeline-diagram__path', diagram);
    const moon = scope.el('span', 'apollo-timeline-diagram__moon', diagram, ctx.t('timeline.moon'));
    earth.setAttribute('aria-hidden', 'true');
    path.setAttribute('aria-hidden', 'true');
    moon.setAttribute('aria-hidden', 'true');
    const signal = scope.el('div', 'apollo-timeline-signal', shell);
    signal.setAttribute('role', 'status');

    const card = scope.el('section', 'apollo-timeline-card', hud.panel);
    card.setAttribute('aria-live', 'polite');
    const stamp = scope.el('p', 'apollo-timeline-card__stamp', card);
    const machine = scope.el('p', 'apollo-timeline-card__machine', card);
    const title = scope.el('h2', 'apollo-timeline-card__title', card);
    const line = scope.el('p', 'apollo-timeline-card__line', card);
    const markerLabel = scope.el('label', 'apollo-timeline-card__label', hud.panel, ctx.t('timeline.slider'));
    const slider = scope.el('input', 'apollo-timeline-card__slider', markerLabel);
    slider.type = 'range';
    slider.min = '0';
    slider.max = String(APOLLO_TIMELINE.length - 1);
    slider.step = '1';
    slider.value = '0';

    let index = 0;
    let finished = false;
    const ascentHeight = ctx.objects.ascent.position.y;
    const previous = hud.button(ctx.t('timeline.previous'), () => move(-1), 'btn alt');
    const next = hud.button(ctx.t('timeline.next'), () => move(1), 'btn');

    const applyVignette = (id: string): void => {
      const event = APOLLO_TIMELINE.find((item) => item.id === id);
      const { objects, machine: station } = ctx;
      const eventIndex = APOLLO_TIMELINE.findIndex((item) => item.id === id);
      objects.eagle.visible = true;
      objects.ascent.visible = eventIndex < APOLLO_TIMELINE.findIndex((item) => item.id === 'jettison');
      objects.astronautA.visible = id === 'firstStep';
      objects.astronautB.visible = id === 'firstStep';
      objects.retroreflector.visible = eventIndex >= APOLLO_TIMELINE.findIndex((item) => item.id === 'unload');
      objects.flag.visible = eventIndex >= APOLLO_TIMELINE.findIndex((item) => item.id === 'surfaceWork');
      objects.tvCamera.visible = objects.flag.visible;
      objects.solarWindExperiment.visible = objects.flag.visible;
      objects.flag.rotation.z = eventIndex >= APOLLO_TIMELINE.findIndex((item) => item.id === 'liftoff') ? Math.PI / 2 : 0;
      station.root.visible = eventIndex >= APOLLO_TIMELINE.findIndex((item) => item.id === 'unload');
      station.power =
        eventIndex >= APOLLO_TIMELINE.findIndex((item) => item.id === 'sunset') &&
        eventIndex < APOLLO_TIMELINE.findIndex((item) => item.id === 'wake')
          ? 0
          : 1;
      if (event?.vignette === 'landing') objects.ascent.visible = true;
    };

    const resetScene = (): void => {
      ctx.machine.place(0, 0, 0);
      ctx.machine.root.visible = true;
      ctx.machine.power = 1;
      ctx.objects.eagle.visible = true;
      ctx.objects.ascent.visible = true;
      ctx.objects.ascent.position.y = ascentHeight;
      ctx.objects.astronautA.visible = ctx.objects.astronautB.visible = false;
      ctx.objects.retroreflector.visible = false;
      ctx.objects.flag.visible = ctx.objects.tvCamera.visible = ctx.objects.solarWindExperiment.visible = false;
      ctx.objects.flag.rotation.z = 0;
    };

    const render = (speak: boolean): void => {
      const event = APOLLO_TIMELINE[index];
      if (import.meta.env.DEV && !ctx.fact(event.fact)) {
        console.warn(`[facts] timeline event "${event.id}" points at unknown fact "${event.fact}"`);
      }
      slider.value = String(index);
      stamp.textContent = ctx.t(event.stamp);
      machine.textContent = ctx.t(`timeline.machine.${event.machine}`);
      machine.className = `apollo-timeline-card__machine apollo-timeline-card__machine--${event.machine}`;
      title.textContent = ctx.t(event.title);
      line.textContent = ctx.t(event.line);
      slider.setAttribute('aria-valuetext', `${ctx.t(event.stamp)} · ${ctx.t(event.title)}`);
      const signalAlive = event.id !== 'sunset' && event.id !== 'shutdown';
      signal.textContent = ctx.t(signalAlive ? 'timeline.signal.alive' : 'timeline.signal.quiet');
      signal.classList.toggle('apollo-timeline-signal--quiet', !signalAlive);
      hud.status(ctx.t('timeline.status', { current: index + 1, total: APOLLO_TIMELINE.length }));
      hud.progress(index / (APOLLO_TIMELINE.length - 1));
      previous.disabled = index === 0;
      next.textContent = index === APOLLO_TIMELINE.length - 1 ? ctx.t('timeline.finish') : ctx.t('timeline.next');
      applyVignette(event.id);
      if (speak) ctx.audio.say(ctx.t(event.line), { episode: ctx.episode.id, key: event.line, role: 'machine' });
    };

    function move(amount: number): void {
      if (finished) return;
      const nextIndex = index + amount;
      if (nextIndex < 0) return;
      if (nextIndex >= APOLLO_TIMELINE.length) {
        finished = true;
        hud.hintDone();
        hud.progress(1);
        resetScene();
        win();
        return;
      }
      index = nextIndex;
      render(true);
    }

    scope.listen(slider, 'input', () => {
      index = Number(slider.value);
      render(false);
    });
    scope.listen(slider, 'change', () => {
      const event = APOLLO_TIMELINE[index];
      ctx.audio.say(ctx.t(event.line), { episode: ctx.episode.id, key: event.line, role: 'machine' });
    });
    resetScene();
    hud.hintDone();
    render(true);
  });

export default timeline;
