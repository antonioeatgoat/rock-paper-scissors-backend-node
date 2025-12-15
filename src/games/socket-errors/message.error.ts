import { ErrorCode } from '../enums/error-code.enum';

export class MessageError {
  constructor(private readonly _message: string) {}

  code(): ErrorCode {
    return ErrorCode.GENERIC;
  }

  message(): string {
    return this._message;
  }
}
