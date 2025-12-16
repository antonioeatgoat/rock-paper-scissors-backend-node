import { Game } from '../game/game';
import { QueryInterface } from './query.interface';

export abstract class GamesRepositoryService {
  abstract insert(game: Game): Promise<void>;
  abstract update(game: Game): Promise<boolean>;
  abstract findById(id: string): Promise<Game | null>;
  abstract find(query: QueryInterface): Promise<Game[]>;
}
