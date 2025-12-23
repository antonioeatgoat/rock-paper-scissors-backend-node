import { ErrorCode } from '@/games/application/websocket/enums/error-code.enum';

export abstract class GenericSocketError {
  abstract code(): ErrorCode;
  abstract message(): string;
}
