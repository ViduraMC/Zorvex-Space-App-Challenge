# Contributing

Read `CLAUDE.md` first. You need Node 22.18 or newer.

```bash
npm install
npm run dev          # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Start the app with live reload |
| `npm run build` | Type-check and build into `dist/` |
| `npm run lint` / `npm run typecheck` / `npm test` | Code checks |
| `npm run check:facts` | List facts without a source and anything marked `TODO-VERIFY` |
| `npm run new:episode <id>` | Create an episode from the template |
| `npm run optimize:models` | Compress raw models from `models-src/<episode>/` into the episode's `assets/` |

Dev-only page with every mini-game: <http://localhost:5173/#ep-_playground>

## How to add an episode in 6 steps

(Tested on 14 Nov 2026: a generated episode played to its patch with no engine edits.)

1. **Branch and generate.** `git switch -c episode/<id>` then `npm run new:episode <id>`.
   Use the id of your explorer in `src/data/explorers.mars.json` or `explorers.moon.json`
   (for example `opportunity`). The Explore button then opens your episode automatically.
2. **Facts first.** Fill `src/episodes/<id>/facts.json`: every fact in plain English with the
   NASA page it was checked on. See `docs/FACTS_POLICY.md`.
3. **Creative pass.** Do the creative pass from `CLAUDE.md` and get your owner's OK.
4. **Write the script** in `episode.ts`. It is data: pages of steps.

   ```ts
   [
     { place: { x: 0, z: 0 } },                                   // where the machine stands
     { shot: { pos: [6, 2, 5], look: [0, 0.4, 0] } },             // camera cut
     { shot: { pos: [3, 1, 2.4], look: [0, 0.4, 0], ms: 9000 } }, // slow push-in
     { caption: 'p1.where', fact: 'landing' },                    // narrator box
     { say: 'p1.hello', fact: null },                             // the machine speaks
     { sfx: 'sfx.whirr', sound: 'beep' },                         // sound-effect word
     { play: 'holdToScan', config: { goal: 'p2.goal', hint: 'p2.hint', /* ... */ } },
     { patch: true },                                             // last step of the last page
   ]
   ```

   All step types are in `src/engine/types.ts`; `src/episodes/sojourner/` is a full example.
   Every `say` needs `fact`: a fact id, or `null` for pure feeling.
5. **Write the words** in `i18n/en.json` (then `si.json` and `ta.json`). Voice clips go in
   `voice/<lang>/<key>.mp3`; a line without a clip is read aloud by the browser.
6. **Check and send.** `npm run check:facts`, `npm run lint`, `npm run typecheck`, `npm test`,
   then run `docs/FUN_CHECKLIST.md`, log AI use in `docs/AI_USAGE.md`, and open a pull request.

Custom 3D objects and actions go in a `scene.ts` beside your script (see Sojourner's). A model
goes in `assets/` after `npm run optimize:models`; set `machine: { model: 'name.glb' }`.

## How to add a mini-game

(The kit games are tested; this custom-game path is written but has not been run yet. Tell Vidura if it breaks.)

A game that only your episode needs lives in `src/episodes/<id>/games/<name>.ts`:

```ts
import type { BaseGameConfig, MiniGame } from '../../../engine/play';

interface Config extends BaseGameConfig {
  taps: number;
}

const tapGame: MiniGame<Config> = ({ ctx, scope, hud }, config) =>
  new Promise<void>((win) => {
    let n = 0;
    hud.button(ctx.t('game.tap'), () => {
      hud.hintDone();
      hud.progress(++n / config.taps);
      if (n >= config.taps) win();
    });
    scope.add(() => console.log('cleaned up'));
  });

export default tapGame;
```

Start it with `{ play: 'custom:<name>', config: { goal: 'key', hint: 'key', taps: 5 } }`.
The frame gives you the goal line, the hint, Skip and the win moment. You add the rules.
Put every listener, element and timer in `scope` so Skip can remove them. On a mistake call
`hud.fail('ui.sfx.oops')`: failure is funny, never a punishment.

A game that several episodes need belongs in `src/engine/play/`. Ask Vidura.
