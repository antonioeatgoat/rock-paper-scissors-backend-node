import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { GamesGateway } from './games.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, UsersModule],
  providers: [GamesGateway],
})
export class GamesModule {}
