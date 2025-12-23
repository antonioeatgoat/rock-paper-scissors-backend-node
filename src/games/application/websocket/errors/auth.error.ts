import { ErrorCode } from '@/games/application/websocket/enums/error-code.enum';
import { GenericSocketError } from '@/games/application/websocket/errors/generic-socket.error';

export class AuthError extends GenericSocketError {
  code(): ErrorCode {
    return ErrorCode.AUTH_ERROR;
  }

  message(): string {
    return 'Cannot authenticate current user.';
  }
}
