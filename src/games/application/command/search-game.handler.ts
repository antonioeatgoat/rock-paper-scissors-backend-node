import { Injectable, Logger } from '@nestjs/common';

import { CommandHandler } from '@/games/application/command/command-handler.interface';
import { SearchGameCommand } from '@/games/application/command/search-game.command';
import { GameFetcher } from '@/games/application/services/game-fetcher';
import { MatchmakingService } from '@/games/application/services/matchmaking.service';
import { GatewayEmitterService } from '@/games/application/websocket/gateway-emitter.service';

@Injectable()
export class SearchGameHandler implements CommandHandler<SearchGameCommand> {
  private readonly logger = new Logger(SearchGameHandler.name);

  constructor(
    private readonly gameFetcher: GameFetcher,
    private readonly emitter: GatewayEmitterService,
    private readonly matchmaking: MatchmakingService,
  ) {}

  async execute(command: SearchGameCommand): Promise<void> {
    const existingGame = await this.gameFetcher.currentGameOfPlayer(
      command.player,
    );

    if (existingGame) {
      this.emitter.emitGameJoined(existingGame, command.player);
      this.logger.warn(
        'An user re-joined an existing game in an expected way',
        { user: command.player.id(), game: existingGame.id() },
      );
      return;
    }

    const newGame = await this.matchmaking.searchGame(command.player);

    if (!newGame) {
      this.emitter.emitWaitingForOpponent(command.player);
      return;
    }

    this.emitter.emitGameJoined(newGame);
  }
}
