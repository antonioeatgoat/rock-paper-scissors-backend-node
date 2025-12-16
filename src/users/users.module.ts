import { Module } from '@nestjs/common';

import { InMemoryRepository } from './repositories/in-memory.repository';
import { UsersRepositoryService } from './users-repository.service';

@Module({
  providers: [
    {
      provide: UsersRepositoryService,
      useClass: InMemoryRepository,
    },
  ],
  exports: [UsersRepositoryService],
})
export class UsersModule {}
