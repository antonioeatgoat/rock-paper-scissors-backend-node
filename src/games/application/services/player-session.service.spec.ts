import { Socket } from 'socket.io';

import { PlayerSessionService } from '@/games/application/services/player-session.service';
import { Player } from '@/games/domain/player/player';
import { User } from '@/users/user/user';

describe('PlayerSession', () => {
  let service: PlayerSessionService;
  const user = new User('Bob');
  const socket = { socketId: 123456 } as unknown as Socket;

  beforeEach(() => {
    service = new PlayerSessionService();

    service.registerUser(user, socket);

    jest.clearAllMocks();
  });

  it('Should recognize the user id of registered users', () => {
    expect(service.playerExists(user.id())).toBe(true);
  });

  it('Should return the correct player', () => {
    const result = service.getPlayer(user.id());

    expect(result).toBeInstanceOf(Player);
    expect(result.id()).toBe(user.id());
    expect(result.nickname()).toBe(user.nickname());
  });

  it('Should return the correct socket', () => {
    const player = service.getPlayer(user.id());
    const result = service.getSocket(player);

    expect(result).toBe(socket);
  });
});
