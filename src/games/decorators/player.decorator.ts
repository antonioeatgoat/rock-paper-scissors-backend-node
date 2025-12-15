import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { SocketWithPlayer } from '../interfaces/socket-with-player';

export const Player = createParamDecorator(
  (_data: string, context: ExecutionContext) => {
    const type = context.getType();

    if (type !== 'ws') {
      throw new BadRequestException(
        'User information cannot be extracted from this request',
      );
    }

    const client = context.switchToWs().getClient<SocketWithPlayer>();
    if (!client.player) {
      throw new BadRequestException(
        'Socket client does not contain user information',
      );
    }

    return client.player;
  },
);
