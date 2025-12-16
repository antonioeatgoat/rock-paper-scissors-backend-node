import { Injectable, Logger } from '@nestjs/common';
import { Player } from '../player/player';
import { User } from '../../users/user/user';
import { MatchmakingService } from './matchmaking.service';
import { Socket } from 'socket.io';
import { PlayerStatus } from '../player/player-status.enum';
import { Game } from '../game/game';
import { GatewayEmitterService } from './gateway-emitter.service';
import { AllowedMove } from '../enums/allowed-move.enum';
import { GamesRepositoryService } from '../repositories/games-repository.service';
import { GameNotFoundError } from '../socket-errors/game-not-found.error';
import { EndedGameError } from '../socket-errors/ended-game.error';
import { PlayerSessionService } from './player-session.service';
import { GameStatus } from '../enums/game-status.enum';
import { PlayerWithMeta } from '../player/player-with-meta';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(
    private readonly repository: GamesRepositoryService,
    private readonly playerSession: PlayerSessionService,
    private readonly matchmaking: MatchmakingService,
    private readonly emitter: GatewayEmitterService,
  ) {}

  connectUser(user: User, client: Socket): PlayerWithMeta {
    if (!this.playerSession.playerExists(user.id())) {
      const newPlayer = this.playerSession.saveNewPlayer(
        user.id(),
        user.nickname(),
        client,
      );

      this.logger.debug('Connecting new player.', {
        player: newPlayer.toJSON(),
      });

      return newPlayer;
    }

    const player = this.playerSession.getPlayerWithMeta(user.id());
    player.changeClient(client);
    this.playerSession.savePlayer(player);

    this.logger.debug('Connecting existing player.', {
      player: player.toJSON(),
    });

    return player;
  }

  async handleSearchingGame(player: PlayerWithMeta) {
    if (player.isPLaying()) {
      const existingGame = await this.currentGameOfPlayer(player.shrink());

      if (existingGame) {
        this.emitter.emitGameJoined(existingGame, player.shrink());
        this.logger.warn(
          'An user re-joined an existing game in an expected way',
          { user: player.id(), game: existingGame.id() },
        );
        return;
      }

      this.logger.debug(
        "Player had status PLAYING but isn't in any running game. Resetting his status",
        { user: player.id() },
      );

      player.changeStatus(PlayerStatus.IDLE);
      this.playerSession.savePlayer(player);
    }

    const newGame = await this.matchmaking.searchGame(player);

    if (!newGame) {
      this.emitter.emitWaitingForOpponent(player.shrink());
      return;
    }

    this.emitter.emitGameJoined(newGame);
  }

  async handleMove(socket: Socket, player: PlayerWithMeta, move: AllowedMove) {
    const game = await this.currentGameOfPlayer(player.shrink());

    if (!game) {
      this.emitter.emitError(socket, new GameNotFoundError());
      this.logger.warn(
        `User ${player.id()} made a move but has no game associated`,
      );
      return;
    }

    if (game.isFinished()) {
      this.logger.warn(
        `User ${player.id()} made a move but the game is finished already.`,
      );
      this.emitter.emitError(socket, new EndedGameError());
      return;
    }

    game.addMove({ player: player.shrink(), move: move });
    await this.repository.update(game);

    if (!game.isFinished()) {
      this.logger.debug(`Player made a move, waiting for the opponent`, {
        gameId: game.id(),
        playerId: player.id(),
      });
      return;
    }

    this.emitter.emitGameFinished(game);
    this.logger.debug(`Game is finished`, {
      game: game.id(),
      winner: game.theWinner()?.toJSON(),
    });
  }

  async handlePlayAgain(player: PlayerWithMeta) {
    await this.handleSearchingGame(player);
  }

  async currentGameOfPlayer(player: Player): Promise<Game | null> {
    const games = await this.repository.find({
      playerId: player.id(),
      status: GameStatus.PLAYING,
    });

    if (games.length > 0) {
      this.logger.debug('Retrieved exisitng game.', games[0].toJSON());
      this.logger.debug(JSON.parse(JSON.stringify(games[0])));
    } else {
      this.logger.debug(
        'Cannot find an existing game for this player.',
        player.toJSON(),
      );
    }

    return games[0];
  }
}
