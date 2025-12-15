import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { GamesGateway } from './games.gateway';
import { AuthModule } from '../auth/auth.module';
import { GamesService } from './services/games.service';
import { MatchmakingService } from './services/matchmaking.service';
import { ResponseBuilderService } from './services/response-builder.service';
import { GatewayEmitterService } from './services/gateway-emitter.service';
import { GamesRepositoryService } from './games-repository.service';
import { InMemoryRepository } from './repositories/in-memory.repository';
import { PlayerSessionService } from './services/player-session.service';
import { GamesController } from './games.controller';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [GamesController],
  providers: [
    {
      provide: GamesRepositoryService,
      useClass: InMemoryRepository,
    },
    GamesGateway,
    GamesService,
    GatewayEmitterService,
    ResponseBuilderService,
    MatchmakingService,
    PlayerSessionService,
  ],
})
export class GamesModule {}
