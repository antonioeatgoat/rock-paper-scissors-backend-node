import { UserStatus } from './user-status.enum';

export class User {
  private readonly _id: string = crypto.randomUUID();

  constructor(
    private readonly _nickname: string,
    private _status: UserStatus = UserStatus.IDLE,
  ) {}

  id(): string {
    return this._id;
  }

  nickname(): string {
    return this._nickname;
  }

  status(): UserStatus {
    return this._status;
  }

  setStatus(status: UserStatus): User {
    this._status = status;
    return this;
  }
}
