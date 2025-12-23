import { Game } from '@/games/domain/game/game';

import { GameStatus } from '../../domain/game/game-status.enum';

import { InMemoryRepository } from './in-memory.repository';

function makeGame(params: {
  id: string;
  status?: string;
  players?: [string, string];
}): Game {
  const { id, status = 'playing', players = ['', ''] } = params;

  return {
    id: jest.fn().mockReturnValue(id),
    status: jest.fn().mockReturnValue(status),
    hasPlayer: jest.fn((playerId: string) => {
      return players.includes(playerId);
    }),
  } as unknown as Game;
}

describe('InMemoryRepository', () => {
  let repo: InMemoryRepository;
  let game1: Game;
  let game2: Game;
  let game3: Game;

  beforeEach(async () => {
    repo = new InMemoryRepository();
    game1 = makeGame({
      id: '123',
      status: GameStatus.PLAYING,
      players: ['111', '222'],
    });
    game2 = makeGame({
      id: '456',
      status: GameStatus.PLAYING,
      players: ['333', '444'],
    });
    game3 = makeGame({
      id: '789',
      status: GameStatus.ENDED,
      players: ['111', '333'],
    });

    await repo.insert(game1);
    await repo.insert(game2);
    await repo.insert(game3);

    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('returns null when not found', async () => {
      await expect(repo.findById('nope')).resolves.toBeNull();
    });

    it('returns game when found', async () => {
      await expect(repo.findById('123')).resolves.toEqual(game1);
    });
  });

  describe('find', () => {
    it('filters by player', async () => {
      const query = { playerId: '111' };
      const result = await repo.find(query);

      expect(result).toEqual([game1, game3]);
    });

    it('filters by status', async () => {
      const query1 = { status: GameStatus.PLAYING };
      await expect(repo.find(query1)).resolves.toEqual([game1, game2]);

      const query2 = { status: GameStatus.ENDED };
      await expect(repo.find(query2)).resolves.toEqual([game3]);
    });

    it('applies player + status together', async () => {
      const query = { playerId: '111', status: GameStatus.PLAYING };
      await expect(repo.find(query)).resolves.toEqual([game1]);
    });

    it('respects limit', async () => {
      const query = { status: GameStatus.PLAYING, limit: 1 };
      const result = await repo.find(query);

      expect(result).toHaveLength(1);
    });
  });

  describe('insert', () => {
    it('throws if game already exists', async () => {
      const game = makeGame({ id: '123' });

      await expect(repo.insert(game)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('updates an existing game and returns true', async () => {
      const newGame1 = makeGame({ id: '123', status: GameStatus.ENDED });

      await expect(repo.update(newGame1)).resolves.toBe(true);
      await expect(repo.findById('123')).resolves.toBe(newGame1);
    });

    it('throws if game does not exist', async () => {
      const game = makeGame({ id: 'nope' });

      await expect(repo.update(game)).rejects.toThrow();
    });
  });
});
