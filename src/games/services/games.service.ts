import { Injectable, Logger } from '@nestjs/common';
import { Player } from '../player/player';
import { User } from '../../users/user/user';
import { MatchmakingService } from './matchmaking.service';
import { Socket } from 'socket.io';
import { PlayerStatus } from '../player/player-status.enum';
import { Game } from '../game/game';
import { GatewayEmitterService } from './gateway-emitter.service';
import { AllowedMove } from '../enums/allowed-move.enum';
import { PlayersSocketMapper } from './players-socket-mapper.service';
import { GamesRepositoryService } from '../games-repository.service';
import { AuthError } from '../socket-errors/auth.error';
import { GameNotFoundError } from '../socket-errors/game-not-found.error';
import { EndedGameError } from '../socket-errors/ended-game.error';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(
    private readonly repository: GamesRepositoryService,
    private readonly matchmaking: MatchmakingService,
    private readonly emitter: GatewayEmitterService,
    private readonly socketMapper: PlayersSocketMapper,
  ) {}

  connectUser(user: User, client: Socket): Player {
    const existingPlayer = this.fetchExistingPlayer(user);

    if (existingPlayer) {
      this.socketMapper.updateSocket(existingPlayer, client);

      return existingPlayer;
    }

    const newPlayer = new Player(
      user.id(),
      user.nickname(),
      // client,
      PlayerStatus.WAITING,
    );

    this.socketMapper.updateSocket(newPlayer, client);

    this.matchmaking.insertPlayer(newPlayer);

    return newPlayer;
  }

  async handleSearchingGame(player: Player) {
    const existingGame = await this.fetchRunningGame(player);

    if (existingGame) {
      this.emitter.emitGameRejoined(existingGame, player);
      return;
    }

    const opponent = this.matchmaking.findOpponent(player);

    if (opponent === undefined) {
      player.status = PlayerStatus.WAITING;
      this.matchmaking.updatePlayer(player);
      this.emitter.emitWaitingForOpponent(player);
      return;
    }

    // If not: create game for user and then join.
    const newGame = await this.matchmaking.createNewGameForPlayers([
      player,
      opponent,
    ]);

    this.emitter.emitGameStarted(newGame);
  }

  async handleMove(socket: Socket, user: User, move: AllowedMove) {
    const player = this.fetchExistingPlayer(user);

    if (!player) {
      this.emitter.emitError(socket, new AuthError());
      this.logger.warn(
        `User ${user.id()} made a move but has no player associated`,
      );
      return;
    }

    const game = await this.fetchRunningGame(player);

    if (!game) {
      this.emitter.emitError(socket, new GameNotFoundError());
      this.logger.warn(
        `User ${user.id()} made a move but has no game associated`,
      );
      return;
    }

    if (game.isFinished()) {
      this.logger.warn(
        `User ${user.id()} made a move but the game is finished already.`,
      );
      this.emitter.emitError(socket, new EndedGameError());
      return;
    }

    game.addMove({ player: player, move: move });
    await this.repository.update(game);

    if (!game.isFinished()) {
      this.logger.debug(`Player made a move, waiting for the opponent`, {
        gameId: game.id(),
        playerId: player.id,
      });
      return;
    }

    // const winner = game.theWinner();

    this.emitter.emitGameFinished(game);
    this.logger.debug(`Game is finished`, {
      game: game.id(),
      winner: game.theWinner()?.toObject(),
    });
  }

  async handlePlayAgain(socket: Socket, user: User) {
    const player = this.fetchExistingPlayer(user);

    if (!player) {
      // TODO Change error?
      this.emitter.emitError(socket, new AuthError());
      this.logger.warn(
        `User ${user.id()} is trying to get a game no player associated.`,
      );
      return;
    }

    await this.handleSearchingGame(player);
  }

  private async fetchRunningGame(player: Player): Promise<Game | undefined> {
    const game = await this.matchmaking.currentGameOfPlayer(player);
    if (game) {
      this.logger.debug('Retrieved exisitng game.', game.toObject());
    } else {
      this.logger.debug(
        'Cannot find an existing game for this player.',
        player.toObject(),
      );
    }

    return game;
  }

  private fetchExistingPlayer(user: User): Player | undefined {
    const player = this.matchmaking.retrievePlayer(user.id());

    if (player instanceof Player) {
      this.logger.debug('Retrieved existing player.', player.toObject());
    }

    return player;
  }
}
