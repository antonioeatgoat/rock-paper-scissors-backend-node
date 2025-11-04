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
      winner: null, // TODO Implement
      startedAt: null, // TODO implement
    };
  }

  error(error: string) {
    return {
      error: error,
    };
  }
}
