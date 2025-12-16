import { ErrorCode } from '../enums/error-code.enum';

import { GenericSocketError } from './generic-socket.error';

export class AuthError extends GenericSocketError {
  code(): ErrorCode {
    return ErrorCode.AUTH_ERROR;
  }

  message(): string {
    return 'Cannot authenticate current user.';
  }
}
