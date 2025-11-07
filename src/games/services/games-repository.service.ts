import { Injectable } from '@nestjs/common';
import { Game } from '../game/game';
import { Player } from '../player/player';
import { GameStatus } from '../game/game-status';

@Injectable()
export class GamesRepositoryService {
  private readonly games: Game[] = []; // TODO convert to Map

  insert(game: Game): void {
    if (this.findById(game.id())) {
      throw new Error('This game already exists');
    }

    this.games.push(game);
  }

  update(game: Game): boolean {
    const index = this.games.findIndex((g) => g.id === game.id);
    if (index === -1) {
      return false;
    }

    this.games[index] = game;
    return true;
  }

  findById(id: string): Game | undefined {
    return this.games.find((game) => game.id() === id);
  }

  findByPlayer(player: Player): Game[] {
    return this.games.filter((game) => game.hasPlayer(player));
  }

  findByStatus(gameStatus: GameStatus): Game[] { // TODO remove?
    return this.games.filter((game) => game.status() === gameStatus);
  }

  all(): Game[] {
    return this.games;
  }
}
