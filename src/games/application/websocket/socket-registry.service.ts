import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

import { Player } from '@/games/domain/player/player';

@Injectable()
export class SocketRegistry {
  private readonly logger = new Logger(SocketRegistry.name);
  private readonly map = new Map<string, Socket>();

  updateSocket(player: Player, socket: Socket) {
    this.map.set(player.id(), socket);
  }

  getSocket(player: Player): Socket {
    const socket = this.map.get(player.id());

    if (!socket) {
      this.logger.error('There is no socket stored for the given player', {
        player: player.toJSON(),
      });
      throw new Error('There is no socket stored for the given player');
    }

    return socket;
  }
}
