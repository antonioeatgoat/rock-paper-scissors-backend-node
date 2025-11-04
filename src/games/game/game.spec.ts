import { Game } from './game';
import { Player } from '../player/player';
import { Socket } from 'socket.io';
import { PlayerStatus } from '../player/player-status.enum';
import { GameStatus } from './game-status';

describe('Game', () => {
  const player1 = new Player(
    '123456',
    'User A',
    PlayerStatus.PLAYING,
    {} as Socket,
  );

  const player2 = new Player(
    '654321',
    'User B',
    PlayerStatus.PLAYING,
    {} as Socket,
  );

  const game = new Game([player1, player2]);
  it('should be defined', () => {
    expect(game).toBeDefined();
  });

  it('should have id status as soon as created', () => {
    expect(game.id()).toBeTruthy();
  });

  it('should have playing status as soon as created', () => {
    expect(game.status()).toEqual(GameStatus.PLAYING);
  });

  it('should recognize players', () => {
    expect(game.hasPlayer(player1)).toBe(true);
    expect(game.hasPlayer(player2)).toBe(true);
    expect(game.hasPlayer({} as Player)).toBe(false);
  });

  it('should retrieve opponents', () => {
    expect(game.opponentOf(player1)).toBe(player2);
    expect(game.opponentOf(player2)).toBe(player1);
    expect(() => game.opponentOf({} as Player)).toThrow(Error);
  });
});
