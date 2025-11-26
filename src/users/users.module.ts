import { Module } from '@nestjs/common';
import { UsersRepositoryService } from './users-repository.service';
import { InMemoryRepository } from './repositories/in-memory.repository';

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
