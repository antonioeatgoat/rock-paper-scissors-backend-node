import { Injectable } from '@nestjs/common';
import { Game } from '../game/game';
import { Player } from '../player/player';
import { GameStatus } from '../game/game-status';

@Injectable()
export class GamesRepositoryService {
  private readonly games: Game[] = [];

  insert(game: Game): void {
    if (this.findById(game.id())) {
      throw new Error('This game already exists');
    }

    this.games.push(game);
  }

  findById(id: string): Game | undefined {
    return this.games.find((game) => game.id() === id);
  }

  findByPlayer(player: Player): Game[] {
    return this.games.filter((game) => game.hasPlayer(player));
  }

  findByStatus(gameStatus: GameStatus): Game[] {
    return this.games.filter((game) => game.status() === gameStatus);
  }

  all(): Game[] {
    return this.games;
  }
}
