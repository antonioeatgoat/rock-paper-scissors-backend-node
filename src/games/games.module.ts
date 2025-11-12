import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { GamesGateway } from './games.gateway';
import { AuthModule } from '../auth/auth.module';
import { GamesService } from './services/games.service';
import { MatchmakingService } from './services/matchmaking.service';
import { GamesRepositoryService } from './services/games-repository.service';
import { ResponseSerializerService } from './services/response-serializer.service';
import { GatewayEmitterService } from './services/gateway-emitter.service';
import { PlayersSocketMapper } from './services/players-socket-mapper.service';

@Module({
  imports: [AuthModule, UsersModule],
  providers: [
    GamesGateway,
    GamesService,
    GatewayEmitterService,
    ResponseSerializerService,
    MatchmakingService,
    GamesRepositoryService,
    PlayersSocketMapper,
  ],
})
export class GamesModule {}
