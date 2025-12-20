import { Injectable } from '@nestjs/common';

import { Game } from '../game/game';
import { Player } from '../player/player';
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
        result: 'tie',
        yourMove: game.moveOf(receiver) ?? '',
        opponentMove: game.moveOf(game.opponentOf(receiver)) ?? '',
      };
    }

    return {
      result: winner.id() === receiver.id() ? 'winner' : 'loser',
      yourMove: game.moveOf(receiver) ?? '',
      opponentMove: game.moveOf(game.opponentOf(receiver)) ?? '',
    };
  }

  opponentLeft(game: Game, receiver: Player) {
    return {
      result: 'opponent_left',
      yourMove: game.moveOf(receiver) ?? '',
      opponentMove: game.moveOf(game.opponentOf(receiver)) ?? '',
    };
  }

  error(error: GenericSocketError) {
    return {
      error: error.code(),
      message: error.message(),
    };
  }
}
