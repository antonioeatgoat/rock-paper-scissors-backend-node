export class User {
  private readonly _id: string = crypto.randomUUID();

  constructor(private readonly _nickname: string) {}

  id(): string {
    return this._id;
  }

  nickname(): string {
    return this._nickname;
  }
}
