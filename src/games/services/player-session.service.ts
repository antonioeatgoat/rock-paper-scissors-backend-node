import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

import { Player } from '../player/player';
import { PlayerStatus } from '../player/player-status.enum';
import { PlayerWithMeta } from '../player/player-with-meta';

@Injectable()
export class PlayerSessionService {
  private readonly players = new Map<string, PlayerWithMeta>();

  saveNewPlayer(
    userId: string,
    nickname: string,
    client: Socket,
    status: PlayerStatus = PlayerStatus.IDLE,
  ) {
    const player = new PlayerWithMeta(userId, nickname, client, status);
    this.players.set(player.id(), player);

    return player;
  }

  savePlayer(player: PlayerWithMeta) {
    this.players.set(player.id(), player);
  }

  playerExists(userID: string): boolean {
    return this.players.has(userID);
  }

  getPlayer(playerId: string): Player {
    if (!this.playerExists(playerId)) {
      throw new Error('Cannot retrieve an expected Player object');
    }

    return (<PlayerWithMeta>this.players.get(playerId)).shrink();
  }

  getPlayerWithMeta(playerId: string): PlayerWithMeta {
    if (!this.playerExists(playerId)) {
      throw new Error('Cannot retrieve an expected Player object');
    }

    return <PlayerWithMeta>this.players.get(playerId);
  }
}
