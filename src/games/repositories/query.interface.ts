import { GameStatus } from '../enums/game-status.enum';

export interface QueryInterface {
  playerId?: string;
  status?: GameStatus;
  limit?: number;
}
