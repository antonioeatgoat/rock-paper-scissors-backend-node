import { Socket } from 'socket.io';
import { PlayerStatus } from './player-status.enum';
import { TransformSocketToId } from '../decorator/transform-socket-to-id.decorator';

export class Player {
  readonly id: string;
  readonly nickname: string;
  status: PlayerStatus;

  @TransformSocketToId()
  readonly socket: Socket;

  constructor(
    id: string,
    nickname: string,
    status: PlayerStatus,
    socket: Socket,
  ) {
    this.id = id;
    this.nickname = nickname;
    this.status = status;
    this.socket = socket;
  }
}
