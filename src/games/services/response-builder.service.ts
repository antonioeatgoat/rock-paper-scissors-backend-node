import { Player } from '../player/player';
import { Game } from '../game/game';
import { Injectable } from '@nestjs/common';
import { GenericSocketError } from '../socket-errors/generic-socket.error';

//TODO Some methods could be grouped and simplified
@Injectable()
export class ResponseBuilderService {
  connectNewGame(game: Game, player: Player) {
    return {
      opponent: game.opponentOf(player).nickname(),
    };
  }

  connectExistingGame(game: Game, player: Player) {
    return {
      status: 'playing',
      opponent: game.opponentOf(player).nickname(),
      yourMove: game.moveOf(player) ?? null,
      opponentMove: game.moveOf(game.opponentOf(player)) ?? null,
      startedAt: null, // TODO implement
    };
  }

  gameFinished(game: Game, receiver: Player) {
    const winner = game.theWinner();

    if (winner === null) {
      return {
        status: 'finished',
        yourMove: game.moveOf(receiver) ?? '',
        opponentMove: game.moveOf(game.opponentOf(receiver)) ?? '',
        winner: false,
        draw: true,
      };
    }

    return {
      status: 'finished',
      yourMove: game.moveOf(receiver) ?? '',
      opponentMove: game.moveOf(game.opponentOf(receiver)) ?? '',
      winner: receiver.id() === winner.id(),
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
