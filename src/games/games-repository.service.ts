import { Game } from './game/game';
import { Player } from './player/player';
import { GameStatus } from './enums/game-status.enum';

export abstract class GamesRepositoryService {
  abstract insert(game: Game): Promise<void>;
  abstract update(game: Game): Promise<boolean>;
  abstract findById(id: string): Promise<Game | null>;
  abstract findByPlayer(player: Player): Promise<Game[]>;
  abstract findByStatus(gameStatus: GameStatus): Promise<Game[]>;
}
