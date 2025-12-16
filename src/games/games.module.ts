import { Module } from '@nestjs/common';

import { AuthModule } from '@/auth/auth.module';
import { UsersModule } from '@/users/users.module';

import { GamesRepositoryService } from './repositories/games-repository.service';
import { InMemoryRepository } from './repositories/in-memory.repository';
import { GamesService } from './services/games.service';
import { GatewayEmitterService } from './services/gateway-emitter.service';
import { MatchmakingService } from './services/matchmaking.service';
import { PlayerSessionService } from './services/player-session.service';
import { ResponseBuilderService } from './services/response-builder.service';
import { GamesController } from './games.controller';
import { GamesGateway } from './games.gateway';

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
