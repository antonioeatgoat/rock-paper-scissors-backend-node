export class Player {
  constructor(
    private readonly _id: string,
    private readonly _nickname: string,
  ) {}

  id(): string {
    return this._id;
  }

  nickname(): string {
    return this._nickname;
  }

  toJSON() {
    return {
      id: this._id,
      nickname: this._nickname,
    };
  }
}
