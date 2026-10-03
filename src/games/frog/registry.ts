import { appleCatchGame } from './apple-catch';
import { frozenAppleGame } from './frozen-apple';
import { lilyJumpGame } from './lily-jump';
import type { FrogGameDef } from './types';

/** Math Frog practice games, in the order the team described them. */
export const FROG_GAMES: FrogGameDef[] = [appleCatchGame, lilyJumpGame, frozenAppleGame];
