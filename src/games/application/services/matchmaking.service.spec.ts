import { Test, TestingModule } from '@nestjs/testing';

import { GameFetcher } from '@/games/application/services/game-fetcher';
import { MatchmakingService } from '@/games/application/services/matchmaking.service';
import { Game } from '@/games/domain/game/game';
import { Player } from '@/games/domain/player/player';
import { GamesRepositoryService } from '@/games/infrastructure/games-repository.service';

describe('MatchmakingService', () => {
  let service: MatchmakingService;

  const gameFetcher = {
    currentGameOfPlayer: jest.fn(),
  };

  const gamesRepository = {
    insert: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchmakingService,
        { provide: GamesRepositoryService, useValue: gamesRepository },
        { provide: GameFetcher, useValue: gameFetcher },
      ],
    }).compile();

    service = module.get<MatchmakingService>(MatchmakingService);
    jest.clearAllMocks();
  });

  it('Should prevent searching for games if a player is already in a game', async () => {
    gameFetcher.currentGameOfPlayer.mockResolvedValueOnce({} as Game);

    const player = new Player('p1', 'Alice');

    await expect(service.searchGame(player)).rejects.toThrow();
  });

  it('Should put player in queue if no other players are waiting', async () => {
    gameFetcher.currentGameOfPlayer.mockResolvedValueOnce(null);

    const player = new Player('p1', 'Alice');

    const result = await service.searchGame(player);

    expect(result).toBeNull();
    expect(service.isInQueue(player)).toBe(true);
    expect(gamesRepository.insert).not.toHaveBeenCalled();
  });

  it('Should create the game if another player waiting exists', async () => {
    gamesRepository.findOne.mockResolvedValueOnce(null);

    const player1 = new Player('p1', 'Alice');
    const player2 = new Player('p2', 'Bob');

    await service.searchGame(player1);
    await service.searchGame(player2);

    expect(gamesRepository.insert).toHaveBeenCalledTimes(1);
    expect(service.isInQueue(player1)).toBe(false);
    expect(service.isInQueue(player2)).toBe(false);
  });
});
