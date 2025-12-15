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
import { Logger, UseGuards, UseInterceptors } from '@nestjs/common';
import { SocketWithUser } from '../auth/interfaces/socket-with-user';
import { AccessTokenService } from '../auth/services/AccessTokenService';
import { GamesService } from './services/games.service';
import { GatewayEmitterService } from './services/gateway-emitter.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { Player as PlayerDecorator } from './decorators/player.decorator';
import { AllowedMove } from './enums/allowed-move.enum';
import { AuthError } from './socket-errors/auth.error';
import { InvalidMoveError } from './socket-errors/invalid-move.error';
import { PlayerInterceptor } from './interceptors/player.interceptor';
import { ListenedWebsocketEvent as Event } from './enums/listened-websocket-event.enum';
import { PlayerWithMeta } from './player/player-with-meta';

@UseInterceptors(PlayerInterceptor)
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

    this.gamesService.connectUser(user, client);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug('Disconnecting: ' + client.id);
  }

  @SubscribeMessage(Event.SEARCH_GAME)
  @UseGuards(AuthenticatedGuard)
  async handleSearchGame(@PlayerDecorator() player: PlayerWithMeta) {
    this.logReceivedEvent(Event.SEARCH_GAME);

    await this.gamesService.handleSearchingGame(player);
  }

  @SubscribeMessage(Event.MAKE_MOVE)
  @UseGuards(AuthenticatedGuard)
  async handleMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() move: string,
    @PlayerDecorator() player: PlayerWithMeta,
  ) {
    this.logReceivedEvent(Event.MAKE_MOVE);

    if (!Object.values(AllowedMove).includes(move as AllowedMove)) {
      this.emitter.emitError(client, new InvalidMoveError());
      this.logger.warn('Received a not valid move');
      return;
    }

    await this.gamesService.handleMove(client, player, move as AllowedMove);
  }

  // TODO This is just a placeholder. It must implement the play again with the same user
  @SubscribeMessage(Event.PLAY_AGAIN)
  @UseGuards(AuthenticatedGuard)
  async handlePlayAgain(@PlayerDecorator() player: PlayerWithMeta) {
    this.logReceivedEvent(Event.PLAY_AGAIN);

    await this.gamesService.handlePlayAgain(player);
  }

  private disconnect(client: Socket) {
    this.logger.debug('Closing Websocket connection.');
    client.disconnect();
  }

  private logReceivedEvent(event: string) {
    this.logger.debug('Received event: ' + event);
  }
}
