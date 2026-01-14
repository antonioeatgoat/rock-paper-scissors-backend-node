import { ResponseBuilderService } from '@/games/application/websocket/response-builder.service';
import { AllowedMove } from '@/games/domain/game/allowed-move.enum';
import { Game } from '@/games/domain/game/game';
import { Player } from '@/games/domain/player/player';

describe('ResponseBuilderService', () => {
  const player1 = new Player('p1', 'Alice');
  const player2 = new Player('p2', 'Bob');

  let service: ResponseBuilderService;

  beforeEach(() => {
    service = new ResponseBuilderService();
  });

  it('builds response for new connection', () => {
    const game = new Game([player1, player2]);

    const response = service.connectNewGame(game, player1);

    expect(response).toEqual({ opponent: 'Bob' });
  });

  it('builds response for re-joining existing game', () => {
    const game = new Game([player1, player2]);
    game.addMove({ player: player1, move: AllowedMove.ROCK });

    const response = service.connectExistingGame(game, player1);

    expect(response).toEqual({
      status: 'playing',
      opponent: 'Bob',
      yourMove: AllowedMove.ROCK,
      opponentMove: null,
      startedAt: null,
    });
  });

  it('builds response for game finished', () => {
    const game = new Game([player1, player2]);
    game.addMove({ player: player1, move: AllowedMove.ROCK });
    game.addMove({ player: player2, move: AllowedMove.SCISSORS });

    const response = service.gameFinished(game, player1);

    expect(response.result).toBe('winner');
    expect(response.yourMove).toBe(AllowedMove.ROCK);
    expect(response.opponentMove).toBe(AllowedMove.SCISSORS);
  });

  it('builds response for opponent left', () => {
    const game = new Game([player1, player2]);
    game.addMove({ player: player1, move: AllowedMove.PAPER });

    const response = service.opponentLeft(game, player1);

    expect(response).toEqual({
      result: 'opponent_left',
      yourMove: AllowedMove.PAPER,
      opponentMove: '',
    });
  });
});
