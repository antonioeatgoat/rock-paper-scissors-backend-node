import { PlayerStatus } from './player-status.enum';

export class Player {
  constructor(
    public readonly id: string,
    public readonly nickname: string,
    public status: PlayerStatus,
  ) {}

  toObject() {
    return {
      id: this.id,
      nickname: this.nickname,
      status: this.status,
    };
  }

  toJSON() {
    return this.toObject();
  }
}
