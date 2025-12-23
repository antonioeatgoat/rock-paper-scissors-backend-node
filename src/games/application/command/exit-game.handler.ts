import { Injectable, Logger } from '@nestjs/common';

import { CommandHandler } from '@/games/application/command/command-handler.interface';
import { ExitGameCommand } from '@/games/application/command/exit-game.command';
import { SelectMoveCommand } from '@/games/application/command/select-move.command';
import { GameFetcher } from '@/games/application/services/game-fetcher';
import { GatewayEmitterService } from '@/games/application/websocket/gateway-emitter.service';
import { GamesRepositoryService } from '@/games/infrastructure/games-repository.service';

@Injectable()
export class ExitGameHandler implements CommandHandler<SelectMoveCommand> {
  private readonly logger = new Logger(ExitGameHandler.name);

  constructor(
    private readonly gameFetcher: GameFetcher,
    private readonly emitter: GatewayEmitterService,
    private readonly gameRepository: GamesRepositoryService,
  ) {}

  async execute(command: ExitGameCommand): Promise<void> {
    const game = await this.gameFetcher.currentGameOfPlayer(command.player);

    if (!game) {
      this.logger.warn(
        `Player trying to leave the current game isn't in any game`,
        { player: command.player.toJSON() },
      );
      return;
    }

    game.endGame(game.opponentOf(command.player));
    await this.gameRepository.update(game);

    this.emitter.emitGameLeft(game, command.player);
  }
}
