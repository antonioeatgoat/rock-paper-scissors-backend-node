import { Game } from '@/games/domain/game/game';
import { GamesRepositoryService } from '@/games/infrastructure/games-repository.service';
import { QueryInterface } from '@/games/infrastructure/repositories/query.interface';

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

  find(query: QueryInterface): Promise<Game[]> {
    const games: Game[] = [];
    for (const game of this.games.values()) {
      if (query.playerId && !game.hasPlayer(query.playerId)) {
        continue;
      }

      if (query.status && game.status() !== query.status) {
        continue;
      }

      games.push(game);

      if (query.limit && games.length === query.limit) {
        break;
      }
    }

    return Promise.resolve(games);
  }

  async findOne(query: QueryInterface): Promise<Game> {
    query.limit = 1;

    const games = await this.find(query);

    return games[0] ?? null;
  }
}
