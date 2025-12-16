import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { AuthenticatedGuard } from '@/auth/guards/authenticated.guard';
import type { RequestWithUser } from '@/auth/interfaces/request-with-user';

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
    private readonly responseSerializer: ResponseBuilderService,
  ) {}

  @UseGuards(AuthenticatedGuard)
  @Get('current-game')
  async getCurrentGame(@Req() req: RequestWithUser) {
    if (!this.playerSession.playerExists(req.user.id())) {
      return { status: 'idle' };
    }

    const player = this.playerSession.getPlayer(req.user.id());
    const game = await this.gamesService.currentGameOfPlayer(player);

    if (!game) {
      return { status: 'waiting' };
    }

    if (game.isFinished()) {
      return this.responseSerializer.gameFinished(game, player);
    } else {
      return this.responseSerializer.connectExistingGame(game, player);
    }
  }
}
