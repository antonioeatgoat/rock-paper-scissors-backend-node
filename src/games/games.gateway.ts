import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SocketWithUser } from '../auth/interfaces/socket-with-user';
import { AccessTokenService } from '../auth/services/AccessTokenService';

@WebSocketGateway()
export class GamesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(GamesGateway.name);

  constructor(private readonly accessTokenService: AccessTokenService) {}

  handleConnection(client: SocketWithUser) {
    this.logger.debug('Websocket connection attempt..');

    const user = this.accessTokenService.extractUserFromWsClient(client);

    if (user === undefined) {
      this.logger.debug('Closing Websocket connection.');
      client.disconnect();
    }

    this.logger.debug('User connected', {
      id: user.id(),
      nickname: user.nickname(),
    });
    client.user = user;
  }

  handleDisconnect(client: Socket) {
    this.logger.debug('Disconnecting: ' + client.id);
  }
}
