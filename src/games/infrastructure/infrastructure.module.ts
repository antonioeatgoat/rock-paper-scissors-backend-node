import { Module } from '@nestjs/common';

import { GamesRepositoryService } from '@/games/infrastructure/games-repository.service';
import { InMemoryRepository } from '@/games/infrastructure/repositories/in-memory.repository';

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
