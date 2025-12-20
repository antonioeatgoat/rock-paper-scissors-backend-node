import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

import { User } from '@/users/user/user';

import { AllowedMove } from '../enums/allowed-move.enum';
import { GameStatus } from '../enums/game-status.enum';
import { Game } from '../game/game';
import { PlayerStatus } from '../player/player-status.enum';
import { PlayerWithMeta } from '../player/player-with-meta';
import { GamesRepositoryService } from '../repositories/games-repository.service';
import { EndedGameError } from '../socket-errors/ended-game.error';
import { GameNotFoundError } from '../socket-errors/game-not-found.error';

import { GatewayEmitterService } from './gateway-emitter.service';
import { MatchmakingService } from './matchmaking.service';
import { PlayerSessionService } from './player-session.service';

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
    const existingGame = await this.currentGameOfPlayer(player);

    if (existingGame) {
      this.emitter.emitGameJoined(existingGame, player.shrink());
      this.logger.warn(
        'An user re-joined an existing game in an expected way',
        { user: player.id(), game: existingGame.id() },
      );
      return;
    }

    const newGame = await this.matchmaking.searchGame(player);

    if (!newGame) {
      this.emitter.emitWaitingForOpponent(player.shrink());
      return;
    }

    this.emitter.emitGameJoined(newGame);
  }

  async handleMove(player: PlayerWithMeta, move: AllowedMove) {
    const game = await this.currentGameOfPlayer(player);

    if (!game) {
      this.emitter.emitError(player.client(), new GameNotFoundError());
      this.logger.warn(
        `User ${player.id()} made a move but has no game associated`,
      );
      return;
    }

    if (game.isFinished()) {
      this.logger.warn(
        `User ${player.id()} made a move but the game is finished already.`,
      );
      this.emitter.emitError(player.client(), new EndedGameError());
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

  async handleExitGame(player: PlayerWithMeta) {
    const game = await this.currentGameOfPlayer(player);

    if (!game) {
      this.logger.warn(
        `Player trying to leave the current game isn't in any game`,
        { player: player.shrink().toJSON() },
      );
      return;
    }

    game.endGame(game.opponentOf(player.shrink()));
    await this.repository.update(game);
    for (const p of game.players()) {
      const playerWithMeta = this.playerSession.getPlayerWithMeta(p.id());
      playerWithMeta.changeStatus(PlayerStatus.IDLE);
      this.playerSession.savePlayer(playerWithMeta);
    }

    this.emitter.emitGameLeft(game, player.shrink());
  }

  async currentGameOfPlayer(player: PlayerWithMeta): Promise<Game | null> {
    this.logger.verbose('Searching for running game of player.', {
      player: player.toJSON(),
    });

    if (!player.isPLaying()) {
      this.logger.verbose('PLayer has no status PLAYING. Skipping it.');
      return null;
    }

    const games = await this.repository.find({
      playerId: player.id(),
      status: GameStatus.PLAYING,
    });

    if (games.length > 0) {
      this.logger.verbose('Game fetched.', {
        game: games[0].toJSON(),
      });
      return games[0];
    }

    this.logger.warn(
      "Player had status PLAYING but isn't in any running game. Resetting his status",
      { user: player.id() },
    );

    player.changeStatus(PlayerStatus.IDLE);
    this.playerSession.savePlayer(player);

    return null;
  }
}
