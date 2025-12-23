import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

import { Player } from '@/games/domain/player/player';
import { User } from '@/users/user/user';

import { SocketRegistry } from './../websocket/socket-registry.service';
import { PlayerSessionService } from './player-session.service';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(
    private readonly playerSession: PlayerSessionService,
    private readonly socketRegistry: SocketRegistry,
  ) {}

  connectUser(user: User, client: Socket): Player {
    if (!this.playerSession.playerExists(user.id())) {
      const newPlayer = this.playerSession.saveNewPlayer(
        user.id(),
        user.nickname(),
      );

      this.logger.debug('Connecting new player.', {
        player: newPlayer.toJSON(),
      });

      this.socketRegistry.updateSocket(newPlayer, client);

      return newPlayer;
    }

    const player = this.playerSession.getPlayer(user.id());
    this.socketRegistry.updateSocket(player, client);

    this.logger.debug('Connecting existing player.', {
      player: player.toJSON(),
    });

    return player;
  }
}
