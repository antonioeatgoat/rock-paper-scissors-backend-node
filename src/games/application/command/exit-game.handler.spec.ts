import { Test, TestingModule } from '@nestjs/testing';

import { ExitGameCommand } from '@/games/application/command/exit-game.command';
import { ExitGameHandler } from '@/games/application/command/exit-game.handler';
import { GameFetcher } from '@/games/application/services/game-fetcher';
import { GatewayEmitterService } from '@/games/application/websocket/gateway-emitter.service';
import { Game } from '@/games/domain/game/game';
import { Player } from '@/games/domain/player/player';
import { GamesRepositoryService } from '@/games/infrastructure/games-repository.service';

describe('ExitGameHandler', () => {
  let handler: ExitGameHandler;

  const gameFetcher = {
    currentGameOfPlayer: jest.fn(),
  };

  const emitter = {
    emitGameLeft: jest.fn(),
  };

  const gameRepository = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExitGameHandler,
        { provide: GameFetcher, useValue: gameFetcher },
        { provide: GatewayEmitterService, useValue: emitter },
        { provide: GamesRepositoryService, useValue: gameRepository },
      ],
    }).compile();

    handler = module.get<ExitGameHandler>(ExitGameHandler);
    jest.clearAllMocks();
  });

  it('Should does nothing when the player is not in a game', async () => {
    const player = new Player('p1', 'Alice');

    gameFetcher.currentGameOfPlayer.mockResolvedValue(null);

    await handler.execute(new ExitGameCommand(player));

    expect(gameRepository.update).not.toHaveBeenCalled();
    expect(emitter.emitGameLeft).not.toHaveBeenCalled();
  });

  it('Should update game status and store it', async () => {
    const player1 = new Player('p1', 'Alice');
    const player2 = new Player('p2', 'Bob');
    const game = new Game([player1, player2]);

    gameFetcher.currentGameOfPlayer.mockResolvedValue(game);

    await handler.execute(new ExitGameCommand(player1));

    expect(gameRepository.update).toHaveBeenCalledWith(game);
    expect(emitter.emitGameLeft).toHaveBeenCalledWith(game, player1);
  });
});
