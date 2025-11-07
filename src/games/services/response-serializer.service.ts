import { Player } from '../player/player';
import { Game } from '../game/game';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponseSerializerService {
  connectNewGame(game: Game, player: Player) {
    return {
      opponent: game.opponentOf(player).nickname,
    };
  }

  connectExistingGame(game: Game, player: Player) {
    return {
      opponent: game.opponentOf(player).nickname,
      gameStatus: game.status(),
      winner: game.theWinner()?.toObject(),
      startedAt: null, // TODO implement
    };
  }

  gameFinished(player: Player, winner: Player | null) {
    return {
      gameStatus: 'finished',
      winner: winner ? player.id === winner.id : null,
      draw: winner === null,
    };
  }

  error(error: string) {
    return {
      error: error,
    };
  }
}
