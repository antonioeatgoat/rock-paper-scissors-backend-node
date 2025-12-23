import { Injectable } from '@nestjs/common';

import { Player } from '@/games/domain/player/player';

@Injectable()
export class PlayerSessionService {
  private readonly players = new Map<string, Player>();

  saveNewPlayer(userId: string, nickname: string) {
    const player = new Player(userId, nickname);
    this.players.set(player.id(), player);

    return player;
  }

  savePlayer(player: Player) {
    this.players.set(player.id(), player);
  }

  // TODO remove?
  playerExists(userID: string): boolean {
    return this.players.has(userID);
  }

  getPlayer(playerId: string): Player {
    if (!this.playerExists(playerId)) {
      throw new Error('Cannot retrieve an expected Player object');
    }

    return <Player>this.players.get(playerId);
  }

  remove(player: Player) {
    this.players.delete(player.id());
  }
}
