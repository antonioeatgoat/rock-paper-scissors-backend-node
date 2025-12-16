import { Logger, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { AuthenticatedGuard } from '@/auth/guards/authenticated.guard';
import { SocketWithUser } from '@/auth/interfaces/socket-with-user';
import { AccessTokenService } from '@/auth/services/AccessTokenService';

import { Player as PlayerDecorator } from './decorators/player.decorator';
import { AllowedMove } from './enums/allowed-move.enum';
import { ListenedWebsocketEvent as Event } from './enums/listened-websocket-event.enum';
import { PlayerInterceptor } from './interceptors/player.interceptor';
import { PlayerWithMeta } from './player/player-with-meta';
import { GamesService } from './services/games.service';
import { GatewayEmitterService } from './services/gateway-emitter.service';
import { AuthError } from './socket-errors/auth.error';
import { InvalidMoveError } from './socket-errors/invalid-move.error';

@UseInterceptors(PlayerInterceptor)
@WebSocketGateway()
export class GamesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GamesGateway.name);

  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly gamesService: GamesService,
    private readonly emitter: GatewayEmitterService,
  ) {}

  afterInit() {
    this.server.on('connection', (socket) => {
      socket.onAny((event, ...args) => {
        this.logger.debug(`WebSocket receives: ${event}`, args);
      });
    });
  }

  async handleConnection(client: SocketWithUser) {
    this.logger.verbose('Websocket connected.', { socket: client.id });

    const user = await this.accessTokenService.extractUserFromWsClient(client);

    if (user === null) {
      this.logger.verbose('Cannot authenticate user.');
      this.emitter.emitError(client, new AuthError());
      this.disconnect(client);
      return;
    }

    client.user = user;
    this.logger.verbose('Adding user object into socket client', {
      user: user.id(),
    });

    this.gamesService.connectUser(user, client);
  }

  handleDisconnect(client: Socket) {
    this.logger.verbose('Websocket connected.', { socket: client.id });
  }

  @SubscribeMessage(Event.SEARCH_GAME)
  @UseGuards(AuthenticatedGuard)
  async handleSearchGame(@PlayerDecorator() player: PlayerWithMeta) {
    await this.gamesService.handleSearchingGame(player);
  }

  @SubscribeMessage(Event.MAKE_MOVE)
  @UseGuards(AuthenticatedGuard)
  async handleMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() move: string,
    @PlayerDecorator() player: PlayerWithMeta,
  ) {
    if (!Object.values(AllowedMove).includes(move as AllowedMove)) {
      this.emitter.emitError(client, new InvalidMoveError());
      this.logger.warn('Received a not valid move', { move: move });
      return;
    }

    await this.gamesService.handleMove(client, player, move as AllowedMove);
  }

  // TODO This is just a placeholder. It must implement the play again with the same user
  @SubscribeMessage(Event.PLAY_AGAIN)
  @UseGuards(AuthenticatedGuard)
  async handlePlayAgain(@PlayerDecorator() player: PlayerWithMeta) {
    await this.gamesService.handlePlayAgain(player);
  }

  private disconnect(client: Socket) {
    this.logger.verbose('Closing Websocket connection.', { socket: client.id });
    client.disconnect();
  }
}
