import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

import { Player } from '@/games/domain/player/player';
import { GamesRepositoryService } from '@/games/infrastructure/games-repository.service';
import { User } from '@/users/user/user';

import { AllowedMove } from '../../domain/game/allowed-move.enum';

import { EndedGameError } from './../websocket/errors/ended-game.error';
import { GameNotFoundError } from './../websocket/errors/game-not-found.error';
import { GatewayEmitterService } from './../websocket/gateway-emitter.service';
import { SocketRegistry } from './../websocket/socket-registry.service';
import { GameFetcher } from './game-fetcher';
import { MatchmakingService } from './matchmaking.service';
import { PlayerSessionService } from './player-session.service';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(
    private readonly repository: GamesRepositoryService,
    private readonly gameFetcher: GameFetcher,
    private readonly playerSession: PlayerSessionService,
    private readonly matchmaking: MatchmakingService,
    private readonly emitter: GatewayEmitterService,
    private readonly socketRegistry: SocketRegistry,
  ) {}

  connectUser(user: User, client: Socket): Player {
    if (!this.playerSession.playerExists(user.id())) {
      const newPlayer = this.playerSession.saveNewPlayer(
        user.id(),
        user.nickname(),
      );

      this.logger.debug('Connecting new player.', {
        player: newPlayer.toJSON(),
      });

      this.socketRegistry.updateSocket(newPlayer, client);

      return newPlayer;
    }

    const player = this.playerSession.getPlayer(user.id());
    this.socketRegistry.updateSocket(player, client);

    this.logger.debug('Connecting existing player.', {
      player: player.toJSON(),
    });

    return player;
  }

  async handleSearchingGame(player: Player) {
    const existingGame = await this.gameFetcher.currentGameOfPlayer(player);

    if (existingGame) {
      this.emitter.emitGameJoined(existingGame, player);
      this.logger.warn(
        'An user re-joined an existing game in an expected way',
        { user: player.id(), game: existingGame.id() },
      );
      return;
    }

    const newGame = await this.matchmaking.searchGame(player);

    if (!newGame) {
      this.emitter.emitWaitingForOpponent(player);
      return;
    }

    this.emitter.emitGameJoined(newGame);
  }

  async handleMove(socket: Socket, player: Player, move: AllowedMove) {
    const game = await this.gameFetcher.currentGameOfPlayer(player);

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

    game.addMove({ player: player, move: move });
    await this.repository.update(game);

    if (!game.isFinished()) {
      this.logger.debug(`Player made a move, waiting for the opponent`, {
        gameId: game.id(),
        playerId: player.id(),
      });
      return;
    }

    this.emitter.emitGameFinished(game);
    for (const p of game.players()) {
      const socket = this.socketRegistry.getSocket(p);
      socket.disconnect(true);
      this.playerSession.remove(p);
    }

    this.logger.debug(`Game is finished`, {
      game: game.id(),
      winner: game.theWinner()?.toJSON(),
    });
  }

  async handlePlayAgain(player: Player) {
    await this.handleSearchingGame(player);
  }

  async handleExitGame(player: Player) {
    const game = await this.gameFetcher.currentGameOfPlayer(player);

    if (!game) {
      this.logger.warn(
        `Player trying to leave the current game isn't in any game`,
        { player: player.toJSON() },
      );
      return;
    }

    game.endGame(game.opponentOf(player));
    await this.repository.update(game);

    this.emitter.emitGameLeft(game, player);
  }
}
