import { Test, TestingModule } from '@nestjs/testing';

import { SearchGameCommand } from '@/games/application/command/search-game.command';
import { SearchGameHandler } from '@/games/application/command/search-game.handler';
import { GameFetcher } from '@/games/application/services/game-fetcher';
import { MatchmakingService } from '@/games/application/services/matchmaking.service';
import { GatewayEmitterService } from '@/games/application/websocket/gateway-emitter.service';
import { Game } from '@/games/domain/game/game';
import { Player } from '@/games/domain/player/player';

describe('SearchGameHandler', () => {
  let handler: SearchGameHandler;

  const gameFetcher = {
    currentGameOfPlayer: jest.fn(),
  };

  const emitter = {
    emitGameJoined: jest.fn(),
    emitWaitingForOpponent: jest.fn(),
  };

  const matchmaking = {
    searchGame: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchGameHandler,
        { provide: GameFetcher, useValue: gameFetcher },
        { provide: GatewayEmitterService, useValue: emitter },
        { provide: MatchmakingService, useValue: matchmaking },
      ],
    }).compile();

    handler = module.get<SearchGameHandler>(SearchGameHandler);
    jest.clearAllMocks();
  });

  it('Should reconnect to existing game when it exists', async () => {
    const player1 = new Player('p1', 'Alice');
    const player2 = new Player('p2', 'Bob');
    const existingGame = new Game([player1, player2]);

    gameFetcher.currentGameOfPlayer.mockResolvedValue(existingGame);

    await handler.execute(new SearchGameCommand(player1));

    expect(emitter.emitGameJoined).toHaveBeenCalledWith(existingGame, player1);
    expect(matchmaking.searchGame).not.toHaveBeenCalled();
    expect(emitter.emitWaitingForOpponent).not.toHaveBeenCalled();
  });

  it('Should put in queue when no opponent is matched', async () => {
    const player = new Player('p1', 'Alice');

    gameFetcher.currentGameOfPlayer.mockResolvedValue(null);
    matchmaking.searchGame.mockResolvedValue(null);

    await handler.execute(new SearchGameCommand(player));

    expect(emitter.emitWaitingForOpponent).toHaveBeenCalledWith(player);
    expect(emitter.emitGameJoined).not.toHaveBeenCalled();
  });

  it('Should emits correct event when opponent is matched', async () => {
    const player1 = new Player('p1', 'Alice');
    const player2 = new Player('p2', 'Bob');
    const newGame = new Game([player1, player2]);

    gameFetcher.currentGameOfPlayer.mockResolvedValue(null);
    matchmaking.searchGame.mockResolvedValue(newGame);

    await handler.execute(new SearchGameCommand(player1));

    expect(emitter.emitGameJoined).toHaveBeenCalledWith(newGame);
  });
});
