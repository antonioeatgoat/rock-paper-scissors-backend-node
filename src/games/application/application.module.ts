import { Module } from '@nestjs/common';

import { AuthModule } from '@/auth/auth.module';
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
export class ApplicationModule {}
