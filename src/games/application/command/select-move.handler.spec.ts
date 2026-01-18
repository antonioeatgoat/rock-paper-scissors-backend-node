import { Test, TestingModule } from '@nestjs/testing';

import { SelectMoveCommand } from '@/games/application/command/select-move.command';
import { SelectMoveHandler } from '@/games/application/command/select-move.handler';
import { GameFetcher } from '@/games/application/services/game-fetcher';
import { EndedGameError } from '@/games/application/websocket/errors/ended-game.error';
import { GameNotFoundError } from '@/games/application/websocket/errors/game-not-found.error';
import { GatewayEmitterService } from '@/games/application/websocket/gateway-emitter.service';
import { AllowedMove } from '@/games/domain/game/allowed-move.enum';
import { Game } from '@/games/domain/game/game';
import { Player } from '@/games/domain/player/player';
import { GamesRepositoryService } from '@/games/infrastructure/games-repository.service';

describe('SelectMoveHandler', () => {
  let handler: SelectMoveHandler;

  const gameFetcher = {
    currentGameOfPlayer: jest.fn(),
  };

  const emitter = {
    emitError: jest.fn(),
    emitGameFinished: jest.fn(),
  };

  const gameRepository = {
    update: jest.fn(),
  };

  const socket = { emit: jest.fn(), id: 'socket-1' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SelectMoveHandler,
        { provide: GameFetcher, useValue: gameFetcher },
        { provide: GatewayEmitterService, useValue: emitter },
        { provide: GamesRepositoryService, useValue: gameRepository },
      ],
    }).compile();

    handler = module.get<SelectMoveHandler>(SelectMoveHandler);
    jest.clearAllMocks();
  });

  it('Should emits an error when no current game exists', async () => {
    const player = new Player('p1', 'Alice');

    gameFetcher.currentGameOfPlayer.mockResolvedValue(null);

    await handler.execute(
      new SelectMoveCommand(socket as never, player, AllowedMove.ROCK),
    );

    expect(emitter.emitError).toHaveBeenCalledWith(
      socket,
      expect.any(GameNotFoundError),
    );
    expect(gameRepository.update).not.toHaveBeenCalled();
  });

  it('Should emits an error when game is already finished', async () => {
    const player1 = new Player('p1', 'Alice');
    const player2 = new Player('p2', 'Bob');
    const game = new Game([player1, player2]);
    game.endGame(); // mark finished

    gameFetcher.currentGameOfPlayer.mockResolvedValue(game);

    await handler.execute(
      new SelectMoveCommand(socket as never, player1, AllowedMove.ROCK),
    );

    expect(emitter.emitError).toHaveBeenCalledWith(
      socket,
      expect.any(EndedGameError),
    );
    expect(gameRepository.update).not.toHaveBeenCalled();
  });

  it('Should update the game and stop if game is not finished', async () => {
    const player1 = new Player('p1', 'Alice');
    const player2 = new Player('p2', 'Bob');
    const game = new Game([player1, player2]);

    gameFetcher.currentGameOfPlayer.mockResolvedValue(game);

    await handler.execute(
      new SelectMoveCommand(socket as never, player1, AllowedMove.ROCK),
    );

    expect(gameRepository.update).toHaveBeenCalledWith(game);
    expect(emitter.emitGameFinished).not.toHaveBeenCalled();
  });

  it('Should emit an event when game is finished', async () => {
    const player1 = new Player('p1', 'Alice');
    const player2 = new Player('p2', 'Bob');
    const game = new Game([player1, player2]);

    // First move already in place
    game.addMove({ player: player2, move: AllowedMove.SCISSORS });

    gameFetcher.currentGameOfPlayer.mockResolvedValue(game);

    await handler.execute(
      new SelectMoveCommand(socket as never, player1, AllowedMove.ROCK),
    );

    expect(gameRepository.update).toHaveBeenCalledWith(game);
    expect(emitter.emitGameFinished).toHaveBeenCalledWith(game);
  });
});
