import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { SocketWithUser } from '../auth/interfaces/socket-with-user';
import { AccessTokenService } from '../auth/services/AccessTokenService';
import { GamesService } from './services/games.service';
import { GatewayEmitterService } from './services/gateway-emitter.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { User } from '../users/user/user';
import { User as UserDecorator } from '../auth/decorators/user.decorator';
import { AllowedMove } from './enums/allowed-move.enum';
import { AuthError } from './socket-errors/auth.error';
import { InvalidMoveError } from './socket-errors/invalid-move.error';

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

  async handleConnection(client: SocketWithUser) {
    this.logger.debug('Websocket connection attempt..');

    const user = await this.accessTokenService.extractUserFromWsClient(client);

    if (user === null) {
      this.emitter.emitError(client, new AuthError());
      this.disconnect(client);
      return;
    }

    this.logger.debug('User connected', {
      id: user.id(),
      nickname: user.nickname(),
    });
    client.user = user;

    const player = this.gamesService.connectUser(user, client);

    await this.gamesService.handleSearchingGame(player);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug('Disconnecting: ' + client.id);
  }

  @SubscribeMessage('make_move')
  @UseGuards(AuthenticatedGuard)
  async handleMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() move: string,
    @UserDecorator() user: User,
  ) {
    this.logReceivedEvent('make_move');

    if (!Object.values(AllowedMove).includes(move as AllowedMove)) {
      this.emitter.emitError(client, new InvalidMoveError());
      this.logger.warn('Received a not valid move');
      return;
    }

    await this.gamesService.handleMove(client, user, move as AllowedMove);
  }

  @SubscribeMessage('play_again')
  @UseGuards(AuthenticatedGuard)
  async handlePlayAgain(
    @ConnectedSocket() client: Socket,
    @UserDecorator() user: User,
  ) {
    this.logReceivedEvent('make_move');

    await this.gamesService.handlePlayAgain(client, user);
  }

  private disconnect(client: Socket) {
    this.logger.debug('Closing Websocket connection.');
    client.disconnect();
  }

  private logReceivedEvent(event: string) {
    this.logger.debug('Received event: ' + event);
  }
}
