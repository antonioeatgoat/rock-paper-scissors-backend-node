import { ErrorCode } from '../enums/error-code.enum';
import { GenericSocketError } from './generic-socket.error';

export class EndedGameError extends GenericSocketError {
  code(): ErrorCode {
    return ErrorCode.ENDED_GAME;
  }

  message(): string {
    return 'Trinew Eneed to interact with an ended game.';
  }
}
