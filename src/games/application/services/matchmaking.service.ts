import { Injectable, Logger } from '@nestjs/common';

import { GameFetcher } from '@/games/application/services/game-fetcher';
import { Game } from '@/games/domain/game/game';
import { Player } from '@/games/domain/player/player';
import { GamesRepositoryService } from '@/games/infrastructure/games-repository.service';

@Injectable()
export class MatchmakingService {
  private readonly logger = new Logger(MatchmakingService.name);
  private waitingPlayer: Player | null = null;

  constructor(
    private readonly gamesRepository: GamesRepositoryService,
    private readonly gameFetcher: GameFetcher,
  ) {}

  isInQueue(player: Player) {
    return this.waitingPlayer?.id() === player.id();
  }

  cleanQueue() {
    this.waitingPlayer = null;
  }

  async searchGame(player: Player): Promise<Game | null> {
    if (await this.gameFetcher.currentGameOfPlayer(player)) {
      this.logger.error(
        'Player is already playing in a game but he is searching for a new one',
        {
          player: player.toJSON(),
        },
      );
      throw new Error('This player cannot search for a new game');
    }

    if (!this.waitingPlayer) {
      this.logger.verbose('Moving player in waiting queue', {
        player: player.id(),
      });
      this.waitingPlayer = player;
      return Promise.resolve(null);
    }

    if (this.waitingPlayer.id() === player.id()) {
      return Promise.resolve(null);
    }

    return await this.createNewGameForPlayers([player, this.waitingPlayer]);
  }

  private async createNewGameForPlayers(
    players: [Player, Player],
  ): Promise<Game> {
    const newGame = new Game([players[0], players[1]]);
    await this.gamesRepository.insert(newGame);

    this.cleanQueue();

    return newGame;
  }
}
