/**
 * The reusable mini-game kit. An episode starts one with a step:
 *   { play: 'holdToScan', config: { goal: 'p4.goal', hint: 'p4.hint', ... } }
 * A game that only one episode needs lives in that episode's games/ folder and is started with
 *   { play: 'custom:myGame', config: { ... } }
 */
import { Vector3 } from 'three';
import type { Scope } from '../scope';
import type { EpisodeContext } from '../types';
import { balance } from './balance';
import { counterRace } from './counterRace';
import { directDrive } from './directDrive';
import { findHidden } from './findHidden';
import { holdToScan } from './holdToScan';
import { GameHud, type BaseGameConfig, type MiniGame } from './kit';
import { resourceManage } from './resourceManage';
import { timingTap } from './timingTap';
import { waypointDrive } from './waypointDrive';

export const GAMES = {
  waypointDrive,
  directDrive,
  holdToScan,
  findHidden,
  timingTap,
  balance,
  resourceManage,
  counterRace,
};

export type GameConfigs = { [K in keyof typeof GAMES]: Parameters<(typeof GAMES)[K]>[1] };
export type { BaseGameConfig, GameApi, MiniGame } from './kit';
export { GameHud, groundPoint, groundRing, onTap, pin, tween } from './kit';

const customGames = import.meta.glob<MiniGame<BaseGameConfig>>('../../episodes/*/games/*.ts', { import: 'default' });

export type GameResult = 'win' | 'skip';

/**
 * Run one mini-game to its end. `onSkip` hands the caller a function that skips the game
 * (the Skip button is always available: no dead ends).
 */
export async function runGame(
  ctx: EpisodeContext,
  name: string,
  config: BaseGameConfig,
  parent: Scope,
  onSkip: (skip: (() => void) | null) => void,
): Promise<GameResult> {
  let game: MiniGame<BaseGameConfig> | undefined;
  if (name.startsWith('custom:')) {
    const load = customGames[`../../episodes/${ctx.episode.id}/games/${name.slice(7)}.ts`];
    game = load ? await parent.wait(load()) : undefined;
  } else {
    game = GAMES[name as keyof typeof GAMES] as MiniGame<BaseGameConfig> | undefined;
  }
  if (!game) {
    console.error(`[play] unknown mini-game "${name}"`);
    return 'skip';
  }

  const { comic, director, audio, fx, machine, t } = ctx;
  const scope = parent.child();
  comic.hideCaption();
  comic.hideBubble();
  director.follow(null);
  director.setFraming('center');
  if (config.camera) void director.shot({ ...config.camera, ms: 900 });
  const hud = new GameHud(ctx, scope, config);

  const result = await parent.wait(
    new Promise<GameResult>((resolve) => {
      onSkip(() => resolve('skip'));
      void game({ ctx, scope, hud }, config).then(() => resolve('win'));
    }),
  );
  onSkip(null);
  scope.dispose();
  machine.stop();
  audio.rise(null);
  director.release();
  director.setFraming('comic');

  if (result === 'win') {
    // the win moment: sound-effect word + sound + sparks + the machine reacting
    comic.sfx(t(config.winSfx ?? 'ui.sfx.win'));
    audio.play('win');
    fx.burst('sparkle', machine.bubblePoint(new Vector3()));
    if (config.winSay) {
      await ctx.say(config.winSay, parent);
      comic.hideBubble();
    }
  }
  return result;
}
