import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

import { Player } from '@/games/domain/player/player';
import { User } from '@/users/user/user';

@Injectable()
export class PlayerSessionService {
  private readonly logger = new Logger(PlayerSessionService.name);
  private readonly sockets = new Map<string, Socket>();
  private readonly players = new Map<string, Player>();

  registerUser(user: User, socket: Socket) {
    if (this.playerExists(user.id())) {
      this.sockets.set(user.id(), socket);
      return this.getPlayer(user.id());
    }

    const player = new Player(user.id(), user.nickname());

    this.players.set(player.id(), player);
    this.sockets.set(user.id(), socket);

    this.logger.debug('Connecting new player.', {
      player: player.toJSON(),
    });

    return player;
  }

  unregister(userId: string) {
    this.players.delete(userId);
    this.sockets.delete(userId);
  }

  playerExists(userID: string): boolean {
    return this.players.has(userID);
  }

  getPlayer(playerId: string): Player {
    if (!this.playerExists(playerId)) {
      throw new Error('Cannot retrieve an expected Player object');
    }

    return <Player>this.players.get(playerId);
  }

  getSocket(player: Player): Socket {
    const socket = this.sockets.get(player.id());

    if (!socket) {
      this.logger.error('There is no socket stored for the given player', {
        player: player.toJSON(),
      });
      throw new Error('There is no socket stored for the given player');
    }

    return socket;
  }
}
