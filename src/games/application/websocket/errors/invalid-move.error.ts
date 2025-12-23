import { ErrorCode } from '@/games/application/websocket/enums/error-code.enum';
import { GenericSocketError } from '@/games/application/websocket/errors/generic-socket.error';

export class InvalidMoveError extends GenericSocketError {
  code(): ErrorCode {
    return ErrorCode.INVALID_MOVE;
  }

  message(): string {
    return 'This move is not valid.';
  }
}
