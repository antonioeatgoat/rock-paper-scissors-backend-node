import { Game } from '../game/game';
import { Player } from '../player/player';
import { GameStatus } from '../game/game-status';
import { GamesRepositoryService } from '../games-repository.service';

export class InMemoryRepository extends GamesRepositoryService {
  private readonly games = new Map<string, Game>();

  async insert(game: Game): Promise<void> {
    if (await this.findById(game.id())) {
      throw new Error('This game already exists');
    }

    this.games.set(game.id(), game);

    return Promise.resolve();
  }

  async update(game: Game): Promise<boolean> {
    if ((await this.findById(game.id())) === null) {
      throw new Error('This game does not exists. You cannot update it.');
    }

    this.games.set(game.id(), game);
    return Promise.resolve(true);
  }

  findById(id: string): Promise<Game | null> {
    return Promise.resolve(this.games.get(id) ?? null);
  }

  findByPlayer(player: Player): Promise<Game[]> {
    const games: Game[] = [];
    for (const game of this.games.values()) {
      if (game.hasPlayer(player)) {
        games.push(game);
      }
    }

    return Promise.resolve(games);
  }

  // TODO remove?
  findByStatus(gameStatus: GameStatus): Promise<Game[]> {
    const games: Game[] = [];
    for (const game of this.games.values()) {
      if (game.status() === gameStatus) {
        games.push(game);
      }
    }

    return Promise.resolve(games);
  }
}
