import { Socket } from 'socket.io';

import { GameStatus } from '../enums/game-status.enum';
import { Player } from '../player/player';
import { PlayerStatus } from '../player/player-status.enum';

import { Game } from './game';

describe('Game', () => {
  const player1 = new Player(
    '123456',
    'User A',
    {} as Socket,
    PlayerStatus.PLAYING,
  );

  const player2 = new Player(
    '654321',
    'User B',
    {} as Socket,
    PlayerStatus.PLAYING,
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
