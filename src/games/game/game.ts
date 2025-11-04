import { Player } from '../player/player';
import { GameStatus } from './game-status';

export class Game {
  private readonly _id: string = crypto.randomUUID();
  private _status: GameStatus = GameStatus.PLAYING;

  constructor(private readonly _players: [Player, Player]) {}

  id(): string {
    return this._id;
  }

  players(): Player[] {
    return this._players;
  }

  hasPlayer(player: Player) {
    return [this._players[0].id, this._players[1].id].includes(player.id);
  }

  status(): GameStatus {
    return this._status;
  }

  opponentOf(player: Player) {
    if (this._players[0].id === player.id) {
      return this._players[1];
    }

    if (this._players[1].id === player.id) {
      return this._players[0];
    }

    throw new Error('This player is not in this game');
  }

  toObject() {
    return {
      id: this._id,
      status: this._status,
      players: [this._players[0].toObject(), this._players[1].toObject()],
    };
  }

  toJSON() {
    return {
      id: this._id,
      status: this._status,
      players: this._players,
    };
  }
}
