import { GameStatus } from '../../domain/game/game-status.enum';

export interface QueryInterface {
  playerId?: string;
  status?: GameStatus;
  limit?: number;
}
