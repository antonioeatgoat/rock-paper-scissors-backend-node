import { PlayerStatus } from './player-status.enum';
import { Socket } from 'socket.io';
import { Player } from './player';

export class PlayerWithMeta {
  constructor(
    private readonly _id: string,
    private readonly _nickname: string,
    private _client: Socket,
    private _status: PlayerStatus = PlayerStatus.IDLE,
  ) {}

  id(): string {
    return this._id;
  }

  nickname(): string {
    return this._nickname;
  }

  client(): Socket {
    return this._client;
  }

  changeClient(client: Socket) {
    this._client = client;
  }

  isPLaying(): boolean {
    return this._status === PlayerStatus.PLAYING;
  }

  changeStatus(status: PlayerStatus) {
    this._status = status;
  }

  shrink(): Player {
    return new Player(this._id, this._nickname);
  }

  toJSON() {
    return {
      id: this._id,
      nickname: this._nickname,
      status: this._status,
      socket: this._client.id,
    };
  }
}
