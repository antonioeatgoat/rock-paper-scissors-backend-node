import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { SocketWithPlayer } from '@/games/application/websocket/interfaces/socket-with-player';

import { PlayerSessionService } from '../../services/player-session.service';

@Injectable()
export class PlayerInterceptor implements NestInterceptor {
  constructor(private readonly sessions: PlayerSessionService) {}

  intercept(ctx: ExecutionContext, next: CallHandler) {
    const type = ctx.getType();

    if (type !== 'ws') {
      throw new BadRequestException(
        'User information cannot be extracted from this request',
      );
    }

    const client = ctx.switchToWs().getClient<SocketWithPlayer>();

    client.player = this.sessions.getPlayer(client.user.id());

    return next.handle();
  }
}
