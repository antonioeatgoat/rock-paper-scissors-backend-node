import { Player } from '../player/player';
import { Game } from '../game/game';
import { Injectable } from '@nestjs/common';
import { GenericSocketError } from '../socket-errors/generic-socket.error';

@Injectable()
export class ResponseSerializerService {
  connectNewGame(game: Game, player: Player) {
    return {
      opponent: game.opponentOf(player).nickname,
    };
  }

  connectExistingGame(game: Game, player: Player) {
    // TODO should be possible to support connection to existing games?
    return {
      opponent: game.opponentOf(player).nickname,
      // gameStatus: game.status(),
      // winner: game.theWinner()?.toObject(),
      startedAt: null, // TODO implement
    };
  }

  gameFinished(game: Game, receiver: Player) {
    const winner = game.theWinner();

    if (winner === null) {
      return {
        gameStatus: 'finished',
        yourMove: game.moveOf(receiver) ?? '',
        opponentMove: game.moveOf(game.opponentOf(receiver)) ?? '',
        winner: false,
        draw: true,
      };
    }

    return {
      gameStatus: 'finished',
      yourMove: game.moveOf(receiver) ?? '',
      opponentMove: game.moveOf(game.opponentOf(receiver)) ?? '',
      winner: receiver.id === winner.id,
      draw: false,
    };
  }

  error(error: GenericSocketError) {
    return {
      error: error.code(),
      message: error.message(),
    };
  }
}
