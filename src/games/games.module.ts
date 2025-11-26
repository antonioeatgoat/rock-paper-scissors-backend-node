import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { GamesGateway } from './games.gateway';
import { AuthModule } from '../auth/auth.module';
import { GamesService } from './services/games.service';
import { MatchmakingService } from './services/matchmaking.service';
import { ResponseSerializerService } from './services/response-serializer.service';
import { GatewayEmitterService } from './services/gateway-emitter.service';
import { PlayersSocketMapper } from './services/players-socket-mapper.service';
import { GamesRepositoryService } from './games-repository.service';
import { InMemoryRepository } from './repositories/in-memory.repository';

@Module({
  imports: [AuthModule, UsersModule],
  providers: [
    {
      provide: GamesRepositoryService,
      useClass: InMemoryRepository,
    },
    GamesGateway,
    GamesService,
    GatewayEmitterService,
    ResponseSerializerService,
    MatchmakingService,
    PlayersSocketMapper,
  ],
})
export class GamesModule {}
