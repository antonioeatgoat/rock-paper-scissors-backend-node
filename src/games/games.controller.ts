import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { AuthenticatedGuard } from '@/auth/guards/authenticated.guard';
import type { RequestWithUser } from '@/auth/interfaces/request-with-user';
import { MatchmakingService } from '@/games/services/matchmaking.service';

import { GamesService } from './services/games.service';
import { PlayerSessionService } from './services/player-session.service';
import { ResponseBuilderService } from './services/response-builder.service';

//TODO This controller should not be part of this module,
// since it provides information on the current user in addition to the current game
@Controller('games')
export class GamesController {
  constructor(
    private readonly playerSession: PlayerSessionService,
    private readonly gamesService: GamesService,
    private readonly matchmaking: MatchmakingService,
    private readonly responseSerializer: ResponseBuilderService,
  ) {}

  @UseGuards(AuthenticatedGuard)
  @Get('current-game')
  async getCurrentGame(@Req() req: RequestWithUser) {
    if (!this.playerSession.playerExists(req.user.id())) {
      return { status: 'idle' };
    }

    const player = this.playerSession.getPlayerWithMeta(req.user.id());

    if (this.matchmaking.isInQueue(player)) {
      return { status: 'waiting' };
    }

    const game = await this.gamesService.currentGameOfPlayer(player);

    if (!game) {
      return { status: 'idle' };
    }

    if (game.isFinished()) {
      return this.responseSerializer.gameFinished(game, player.shrink());
    } else {
      return this.responseSerializer.connectExistingGame(game, player.shrink());
    }
  }
}
