import { Module } from '@nestjs/common';

import { InMemoryRepository } from '@/users/repositories/in-memory.repository';
import { UsersRepositoryService } from '@/users/users-repository.service';

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
