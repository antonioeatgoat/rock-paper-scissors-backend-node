import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { RequestWithUser } from '../interfaces/request-with-user';
import { SocketWithUser } from '../interfaces/socket-with-user';

export const User = createParamDecorator(
  (_data: string, context: ExecutionContext) => {
    const type = context.getType();

    if (type === 'http') {
      const request = context.switchToHttp().getRequest<RequestWithUser>();
      return request.user;
    }

    if (type === 'ws') {
      const client = context.switchToWs().getClient<SocketWithUser>();
      return client.user;
    }

    throw new BadRequestException('User cannot be extracted from this request');
  },
);
