import { Logger } from '@nestjs/common';

import { User } from '../user/user';
import { UsersRepositoryService } from '../users-repository.service';

export class InMemoryRepository extends UsersRepositoryService {
  private readonly logger = new Logger(InMemoryRepository.name);
  private readonly users = new Map<string, User>();

  save(user: User): Promise<void> {
    this.logger.debug('Updating user', user.id());
    this.logger.verbose('New user data', user);

    this.users.set(user.id(), user);
    return Promise.resolve();
  }

  findById(id: string): Promise<User | null> {
    this.logger.verbose('Fetching user by id', id);

    return Promise.resolve(this.users.get(id) ?? null);
  }

  findByNickname(nickname: string): Promise<User | null> {
    this.logger.verbose('Fetching user by nickname', nickname);

    for (const user of this.users.values()) {
      if (user.nickname() === nickname) {
        return Promise.resolve(user);
      }
    }

    return Promise.resolve(null);
  }
}
