/**
 * The long watch: drag a timeline from launch (1975) to the last signal (1982) and watch each of
 * the four machines fall silent on its own date. Filter by Viking 1, Viking 2 or both.
 * Where NASA pages differ by a day or two, the label shows the range (see facts.json).
 */
import type { BaseGameConfig, MiniGame } from '../../../engine/play';

type Craft = 'v1o' | 'v1l' | 'v2o' | 'v2l';
type Mission = 'v1' | 'v2';

interface Event {
  date: string;
  /** i18n key of the event text. */
  key: string;
  /** The fact in facts.json this event rests on. */
  fact: string;
  /** i18n key of the date label (for ranges and months). */
  when: string;
  mission: Mission | 'both';
  /** The machine that falls silent at this event. */
  ends?: Craft;
}

const EVENTS: Event[] = [
  { date: '1975-08-20', key: 'tl.launch1', fact: 'launch-1', when: 'tl.d.launch1', mission: 'v1' },
  { date: '1975-09-09', key: 'tl.launch2', fact: 'launch-2', when: 'tl.d.launch2', mission: 'v2' },
  { date: '1976-06-19', key: 'tl.orbit1', fact: 'arrival', when: 'tl.d.orbit1', mission: 'v1' },
  { date: '1976-07-20', key: 'tl.land1', fact: 'landing-1', when: 'tl.d.land1', mission: 'v1' },
  { date: '1976-08-07', key: 'tl.orbit2', fact: 'arrival', when: 'tl.d.orbit2', mission: 'v2' },
  { date: '1976-09-03', key: 'tl.land2', fact: 'landing-2', when: 'tl.d.land2', mission: 'v2' },
  { date: '1976-11-01', key: 'tl.primary', fact: 'primary-mission', when: 'tl.d.primary', mission: 'both' },
  { date: '1978-07-24', key: 'tl.end.v2o', fact: 'v2-orbiter-end', when: 'tl.d.v2o', mission: 'v2', ends: 'v2o' },
  { date: '1980-04-11', key: 'tl.end.v2l', fact: 'v2-lander-end', when: 'tl.d.v2l', mission: 'v2', ends: 'v2l' },
  { date: '1980-08-07', key: 'tl.end.v1o', fact: 'v1-orbiter-end', when: 'tl.d.v1o', mission: 'v1', ends: 'v1o' },
  { date: '1982-11-11', key: 'tl.end.v1l', fact: 'v1-lander-end', when: 'tl.d.v1l', mission: 'v1', ends: 'v1l' },
];

const CRAFT: { id: Craft; key: string; mission: Mission }[] = [
  { id: 'v1o', key: 'tl.craft.v1o', mission: 'v1' },
  { id: 'v1l', key: 'tl.craft.v1l', mission: 'v1' },
  { id: 'v2o', key: 'tl.craft.v2o', mission: 'v2' },
  { id: 'v2l', key: 'tl.craft.v2l', mission: 'v2' },
];

const START = Date.parse(EVENTS[0].date);
const END = Date.parse(EVENTS[EVENTS.length - 1].date);
const STEPS = 1000;
const FIRST_YEAR = 1975;
const LAST_YEAR = 1982;

const timeline: MiniGame<BaseGameConfig> = ({ ctx, scope, hud }) => {
  const { t, audio, comic, machine, sky } = ctx;
  let filter: Mission | 'both' = 'both';
  let lastIndex = -1;

  const box = scope.el('div', 'g-timeline', hud.panel);
  const status = scope.el('div', 'g-tl-craft', box);
  const dots = CRAFT.map((c) => {
    const row = scope.el('span', `g-tl-dot ${c.mission}`, status, t(c.key));
    row.dataset.state = 'on';
    return { craft: c, row };
  });
  const card = scope.el('div', 'g-tl-card', box);
  const cardDate = scope.el('b', '', card);
  const cardText = scope.el('span', '', card);
  const years = scope.el('div', 'g-tl-years', box);
  for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) scope.el('span', '', years, String(y));
  const slider = scope.el('input', 'g-tl-slider', box);
  slider.type = 'range';
  slider.min = '0';
  slider.max = String(STEPS);
  slider.value = '0';
  slider.setAttribute('aria-label', t('tl.slider'));
  const filters = scope.el('div', 'g-tl-filters', box);
  scope.el('small', 'g-tl-note', box, t('tl.note'));

  const filterButtons = (['v1', 'v2', 'both'] as const).map((f) => {
    const b = scope.el('button', 'chip', filters, t(`tl.filter.${f}`));
    b.type = 'button';
    b.setAttribute('aria-pressed', String(f === filter));
    b.addEventListener('click', () => {
      filter = f;
      filterButtons.forEach((x, i) => x.setAttribute('aria-pressed', String(['v1', 'v2', 'both'][i] === f)));
      lastIndex = -1;
      render();
    });
    return b;
  });

  function render(): void {
    const now = START + ((END - START) * Number(slider.value)) / STEPS;
    const visible = EVENTS.filter((e) => filter === 'both' || e.mission === filter || e.mission === 'both');
    let index = -1;
    visible.forEach((e, i) => {
      if (Date.parse(e.date) <= now) index = i;
    });
    const event = visible[Math.max(0, index)];
    cardDate.textContent = t(event.when);
    cardText.textContent = t(event.key);
    if (index !== lastIndex) {
      if (lastIndex !== -1 && index > lastIndex) audio.play(event.ends ? 'powerDown' : 'tick');
      lastIndex = index;
    }
    for (const d of dots) {
      const end = EVENTS.find((e) => e.ends === d.craft.id);
      const silent = end ? Date.parse(end.date) <= now : false;
      d.row.dataset.state = silent ? 'off' : 'on';
      d.row.hidden = filter !== 'both' && d.craft.mission !== filter;
    }
    // the scene follows the timeline: days pass, and the lander's light goes out at the end
    const progress = Number(slider.value) / STEPS;
    sky.state.day = 0.55 - progress * 0.45;
    sky.state.sunset = 0.3 + progress * 0.7;
    const v1LanderEnd = Date.parse(EVENTS[EVENTS.length - 1].date);
    machine.power = now >= v1LanderEnd ? 0.04 : 1 - progress * 0.5;
    hud.progress(progress);
  }

  render();
  return new Promise<void>((win) => {
    scope.listen(slider, 'input', () => {
      hud.hintDone();
      render();
      if (Number(slider.value) >= STEPS) {
        comic.sfx(t('sfx.silence'));
        win();
      }
    });
  });
};

export default timeline;
