import { Socket } from 'socket.io';
import { PlayerStatus } from './player-status.enum';

export class Player {
  constructor(
    public readonly id: string,
    public readonly nickname: string,
    public socket: Socket,
    public status: PlayerStatus,
  ) {}

  toObject() {
    return {
      id: this.id,
      nickname: this.nickname,
      status: this.status,
      socket: this.socket.id,
    };
  }

  toJSON() {
    return this.toObject();
  }
}
