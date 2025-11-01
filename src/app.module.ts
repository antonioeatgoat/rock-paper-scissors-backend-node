import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GamesModule } from './games/games.module';
import { PresentationModule } from './presentation/presentation.module';
@Module({
  imports: [AuthModule, UsersModule, GamesModule, PresentationModule],
  providers: [],
})
export class AppModule {}
