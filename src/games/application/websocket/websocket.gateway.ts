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
import { ExitGameCommand } from '@/games/application/command/exit-game.command';
import { SearchGameCommand } from '@/games/application/command/search-game.command';
import { SelectMoveCommand } from '@/games/application/command/select-move.command';
import { CommandBus } from '@/games/application/command-bus.service';
import { PlayerSessionService } from '@/games/application/services/player-session.service';
import { Player as PlayerDecorator } from '@/games/application/websocket/decorators/player.decorator';
import { ListenedWebsocketEvent as Event } from '@/games/application/websocket/enums/listened-websocket-event.enum';
import { AuthError } from '@/games/application/websocket/errors/auth.error';
import { InvalidMoveError } from '@/games/application/websocket/errors/invalid-move.error';
import { GatewayEmitterService } from '@/games/application/websocket/gateway-emitter.service';
import { PlayerInterceptor } from '@/games/application/websocket/interceptors/player.interceptor';
import { AllowedMove } from '@/games/domain/game/allowed-move.enum';
import { Player } from '@/games/domain/player/player';

@UseInterceptors(PlayerInterceptor)
@WebSocketGateway()
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);

  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly playerSession: PlayerSessionService,
    private readonly emitter: GatewayEmitterService,
    private readonly commandBus: CommandBus,
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

    this.playerSession.registerUser(user, client);
  }

  handleDisconnect(client: Socket) {
    this.logger.verbose('Websocket connected.', { socket: client.id });
  }

  @SubscribeMessage(Event.SEARCH_GAME)
  @UseGuards(AuthenticatedGuard)
  async handleSearchGame(@PlayerDecorator() player: Player) {
    await this.commandBus.execute(new SearchGameCommand(player));
  }

  @SubscribeMessage(Event.MAKE_MOVE)
  @UseGuards(AuthenticatedGuard)
  async handleMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() move: string,
    @PlayerDecorator() player: Player,
  ) {
    if (!Object.values(AllowedMove).includes(move as AllowedMove)) {
      this.emitter.emitError(client, new InvalidMoveError());
      this.logger.warn('Received a not valid move', { move: move });
      return;
    }

    await this.commandBus.execute(
      new SelectMoveCommand(client, player, move as AllowedMove),
    );
  }

  // TODO This is just a placeholder. It must implement the play again with the same user
  @SubscribeMessage(Event.PLAY_AGAIN)
  @UseGuards(AuthenticatedGuard)
  async handlePlayAgain(@PlayerDecorator() player: Player) {
    await this.commandBus.execute(new SearchGameCommand(player));
  }

  @SubscribeMessage(Event.EXIT_GAME)
  @UseGuards(AuthenticatedGuard)
  async handleExitGame(@PlayerDecorator() player: Player) {
    await this.commandBus.execute(new ExitGameCommand(player));
  }

  private disconnect(client: Socket) {
    this.logger.verbose('Closing Websocket connection.', { socket: client.id });
    client.disconnect();
  }
}
