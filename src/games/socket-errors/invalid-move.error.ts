import { ErrorCode } from '../enums/error-code.enum';

import { GenericSocketError } from './generic-socket.error';

export class InvalidMoveError extends GenericSocketError {
  code(): ErrorCode {
    return ErrorCode.INVALID_MOVE;
  }

  message(): string {
    return 'This move is not valid.';
  }
}
