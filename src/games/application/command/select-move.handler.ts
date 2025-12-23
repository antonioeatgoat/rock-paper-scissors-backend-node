import { Injectable, Logger } from '@nestjs/common';

import { CommandHandler } from '@/games/application/command/command-handler.interface';
import { SelectMoveCommand } from '@/games/application/command/select-move.command';
import { GameFetcher } from '@/games/application/services/game-fetcher';
import { PlayerSessionService } from '@/games/application/services/player-session.service';
import { EndedGameError } from '@/games/application/websocket/errors/ended-game.error';
import { GameNotFoundError } from '@/games/application/websocket/errors/game-not-found.error';
import { GatewayEmitterService } from '@/games/application/websocket/gateway-emitter.service';
import { SocketRegistry } from '@/games/application/websocket/socket-registry.service';
import { GamesRepositoryService } from '@/games/infrastructure/games-repository.service';

@Injectable()
export class SelectMoveHandler implements CommandHandler<SelectMoveCommand> {
  private readonly logger = new Logger(SelectMoveHandler.name);

  constructor(
    private readonly gameFetcher: GameFetcher,
    private readonly emitter: GatewayEmitterService,
    private readonly gameRepository: GamesRepositoryService,
    private readonly socketRegistry: SocketRegistry,
    private readonly playerSession: PlayerSessionService,
  ) {}

  async execute(command: SelectMoveCommand): Promise<void> {
    const game = await this.gameFetcher.currentGameOfPlayer(command.player);

    if (!game) {
      this.emitter.emitError(command.socket, new GameNotFoundError());
      this.logger.warn(
        `User ${command.player.id()} made a move but has no game associated`,
      );
      return;
    }

    if (game.isFinished()) {
      this.logger.warn(
        `User ${command.player.id()} made a move but the game is finished already.`,
      );
      this.emitter.emitError(command.socket, new EndedGameError());
      return;
    }

    game.addMove({ player: command.player, move: command.move });
    await this.gameRepository.update(game);

    if (!game.isFinished()) {
      this.logger.debug(`Player made a move, waiting for the opponent`, {
        gameId: game.id(),
        playerId: command.player.id(),
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
}
