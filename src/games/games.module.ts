import { Module } from '@nestjs/common';

import { ApplicationModule } from '@/games/application/application.module';
import { DomainModule } from '@/games/domain/domain.module';
import { InfrastructureModule } from '@/games/infrastructure/infrastructure.module';

@Module({
  imports: [DomainModule, ApplicationModule, InfrastructureModule],
})
export class GamesModule {}
