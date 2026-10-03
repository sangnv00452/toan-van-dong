import { bubblesGame } from './bubbles';
import { clockGame } from './clock';
import { compareGame } from './compare';
import { goalkeeperGame } from './goalkeeper';
import { molesGame } from './moles';
import { ninjaGame } from './ninja';
import { scaleGame } from './scale';
import { shopGame } from './shop';
import { stairsGame } from './stairs';
import type { GameDef } from './types';

/** Menu order. */
export const GAMES: GameDef[] = [
  bubblesGame,
  compareGame,
  molesGame,
  shopGame,
  ninjaGame,
  goalkeeperGame,
  clockGame,
  stairsGame,
  scaleGame,
];
