import { Module } from '@nestjs/common';

import { AuthModule } from '@/auth/auth.module';
import { ExitGameCommand } from '@/games/application/command/exit-game.command';
import { ExitGameHandler } from '@/games/application/command/exit-game.handler';
import { SearchGameCommand } from '@/games/application/command/search-game.command';
import { SearchGameHandler } from '@/games/application/command/search-game.handler';
import { SelectMoveCommand } from '@/games/application/command/select-move.command';
import { SelectMoveHandler } from '@/games/application/command/select-move.handler';
import { CommandBus } from '@/games/application/command-bus.service';
import { GameFetcher } from '@/games/application/services/game-fetcher';
import { SocketRegistry } from '@/games/application/websocket/socket-registry.service';
import { DomainModule } from '@/games/domain/domain.module';
import { InfrastructureModule } from '@/games/infrastructure/infrastructure.module';
import { UsersModule } from '@/users/users.module';

import { GamesService } from './services/games.service';
import { MatchmakingService } from './services/matchmaking.service';
import { PlayerSessionService } from './services/player-session.service';
import { GatewayEmitterService } from './websocket/gateway-emitter.service';
import { ResponseBuilderService } from './websocket/response-builder.service';
import { WebsocketGateway } from './websocket/websocket.gateway';
import { GamesController } from './games.controller';

@Module({
  imports: [DomainModule, InfrastructureModule, AuthModule, UsersModule],
  controllers: [GamesController],
  providers: [
    CommandBus,
    SearchGameHandler,
    SelectMoveHandler,
    ExitGameHandler,
    WebsocketGateway,
    GamesService,
    GatewayEmitterService,
    ResponseBuilderService,
    MatchmakingService,
    PlayerSessionService,
    GameFetcher,
    SocketRegistry,
  ],
})
export class ApplicationModule {
  constructor(
    bus: CommandBus,
    searchGameHandler: SearchGameHandler,
    selectMoveHandler: SelectMoveHandler,
    exitGameHandler: ExitGameHandler,
  ) {
    bus.register(SearchGameCommand.name, searchGameHandler);
    bus.register(SelectMoveCommand.name, selectMoveHandler);
    bus.register(ExitGameCommand.name, exitGameHandler);
  }
}
