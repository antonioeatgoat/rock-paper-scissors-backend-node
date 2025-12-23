import { ErrorCode } from '@/games/application/websocket/enums/error-code.enum';

import { GenericSocketError } from './generic-socket.error';

export class GameNotFoundError extends GenericSocketError {
  code(): ErrorCode {
    return ErrorCode.GAME_NOT_FOUND;
  }

  message(): string {
    return 'Cannot find a valid game.';
  }
}
