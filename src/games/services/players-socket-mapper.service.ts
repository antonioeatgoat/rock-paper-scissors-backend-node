import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Player } from '../player/player';

@Injectable()
export class PlayersSocketMapper {
  private readonly map = new Map<string, Socket>();

  updateSocket(player: Player, socket: Socket) {
    this.map.set(player.id, socket);
  }

  getSocket(player: Player): Socket | undefined {
    return this.map.get(player.id);
  }
}
