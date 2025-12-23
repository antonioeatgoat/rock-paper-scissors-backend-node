import { Injectable, Logger } from '@nestjs/common';

import { Game } from '@/games/domain/game/game';
import { GameStatus } from '@/games/domain/game/game-status.enum';
import { Player } from '@/games/domain/player/player';
import { GamesRepositoryService } from '@/games/infrastructure/games-repository.service';

@Injectable()
export class GameFetcher {
  private readonly logger = new Logger(GameFetcher.name);

  constructor(private readonly gamesRepository: GamesRepositoryService) {}

  async currentGameOfPlayer(player: Player): Promise<Game | null> {
    this.logger.verbose('Searching for running game of player.', {
      player: player.toJSON(),
    });

    const game = await this.gamesRepository.findOne({
      playerId: player.id(),
      status: GameStatus.PLAYING,
    });

    if (game) {
      this.logger.verbose('Game found.', {
        game: game.toJSON(),
      });

      return game;
    }

    this.logger.verbose('No running games found for the player.');

    return null;
  }
}
