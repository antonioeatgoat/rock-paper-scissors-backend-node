import { Injectable, Logger } from '@nestjs/common';
import { Game } from '../game/game';
import { PlayerStatus } from '../player/player-status.enum';
import { GamesRepositoryService } from '../games-repository.service';
import { PlayerSessionService } from './player-session.service';
import { PlayerWithMeta } from '../player/player-with-meta';

@Injectable()
export class MatchmakingService {
  private readonly logger = new Logger(MatchmakingService.name);
  private waitingPlayer: PlayerWithMeta | null = null;

  constructor(
    private readonly playerSession: PlayerSessionService,
    private readonly gamesRepository: GamesRepositoryService,
  ) {}

  async searchGame(player: PlayerWithMeta): Promise<Game | null> {
    if (player.isPLaying()) {
      this.logger.error(
        'Player has status PLAYING but he is searching for a new game',
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
    players: [PlayerWithMeta, PlayerWithMeta],
  ): Promise<Game> {
    for (const player of players) {
      player.changeStatus(PlayerStatus.PLAYING);
      this.playerSession.savePlayer(player);
    }

    const newGame = new Game([players[0].shrink(), players[1].shrink()]);
    await this.gamesRepository.insert(newGame);

    this.cleanWaitingQueue();

    return newGame;
  }

  private cleanWaitingQueue() {
    this.waitingPlayer = null;
  }
}
