import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { AuthenticatedGuard } from '@/auth/guards/authenticated.guard';
import type { RequestWithUser } from '@/auth/interfaces/request-with-user';
import { GameFetcher } from '@/games/application/services/game-fetcher';

import { MatchmakingService } from './services/matchmaking.service';
import { PlayerSessionService } from './services/player-session.service';
import { ResponseBuilderService } from './websocket/response-builder.service';

//TODO This controller should not be part of this module,
// since it provides information on the current user in addition to the current game
@Controller('games')
export class GamesController {
  constructor(
    private readonly playerSession: PlayerSessionService,
    private readonly gameFetcher: GameFetcher,
    private readonly matchmaking: MatchmakingService,
    private readonly responseBuilder: ResponseBuilderService,
  ) {}

  @UseGuards(AuthenticatedGuard)
  @Get('current-game')
  async getCurrentGame(@Req() req: RequestWithUser) {
    if (!this.playerSession.playerExists(req.user.id())) {
      return { status: 'idle' };
    }

    const player = this.playerSession.getPlayer(req.user.id());

    if (this.matchmaking.isInQueue(player)) {
      return { status: 'waiting' };
    }

    const game = await this.gameFetcher.currentGameOfPlayer(player);

    if (!game) {
      return { status: 'idle' };
    }

    // TODO If current game is searched, then there is no way a finished game is returned
    if (game.isFinished()) {
      return this.responseBuilder.gameFinished(game, player);
    } else {
      return this.responseBuilder.connectExistingGame(game, player);
    }
  }
}
