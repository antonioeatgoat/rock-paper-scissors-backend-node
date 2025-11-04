import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SocketWithUser } from '../auth/interfaces/socket-with-user';
import { AccessTokenService } from '../auth/services/AccessTokenService';
import { GamesService } from './services/games.service';
import { ConnectStatus } from './enums/connect-status.enum';
import { GatewayEmitterService } from './services/gateway-emitter.service';

@WebSocketGateway()
export class GamesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GamesGateway.name);

  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly gamesService: GamesService,
    private readonly emitter: GatewayEmitterService,
  ) {}

  handleConnection(client: SocketWithUser) {
    this.logger.debug('Websocket connection attempt..');

    const user = this.accessTokenService.extractUserFromWsClient(client);

    if (user === undefined) {
      this.emitter.emitError(client, 'Cannot authenticate current user.');
      this.disconnect(client);
      return;
    }

    this.logger.debug('User connected', {
      id: user.id(),
      nickname: user.nickname(),
    });
    client.user = user;

    const result = this.gamesService.connectUser(user, client);

    switch (result.status) {
      case ConnectStatus.NEW:
        this.emitter.emitGameStarted(result.game);
        break;
      case ConnectStatus.JOINED_EXISTING:
        this.emitter.emitGameRejoined(result.game, result.currentPlayer);
        break;
      case ConnectStatus.WAITING:
        this.emitter.emitWaitingForOpponent(result.currentPlayer);
        break;
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug('Disconnecting: ' + client.id);
  }

  private disconnect(client: Socket) {
    this.logger.debug('Closing Websocket connection.');
    client.disconnect();
  }
}
