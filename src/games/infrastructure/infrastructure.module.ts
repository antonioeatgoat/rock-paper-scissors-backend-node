import { Module } from '@nestjs/common';

import { InMemoryRepository } from './repositories/in-memory.repository';
import { GamesRepositoryService } from './games-repository.service';

@Module({
  providers: [
    {
      provide: GamesRepositoryService,
      useClass: InMemoryRepository,
    },
  ],
  exports: [GamesRepositoryService],
})
export class InfrastructureModule {}
