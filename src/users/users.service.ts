import { Injectable, Logger } from '@nestjs/common';
import { User } from './user/user';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  private readonly users: User[] = [];

  create(nickname: string): User {
    return new User(nickname);
  }

  storeUser(user: User): void {
    if (this.findById(user.id()) instanceof User) {
      this.logger.log(
        'Attempting to store an user with an ID alredy existing',
        { user: user },
      );
      throw new Error('An user with this ID is already stored.');
    }

    this.users.push(user);
    this.logger.debug('User created', { user: user });
    this.logger.debug('Current users list', this.users);
  }

  findById(id: string): User | undefined {
    return this.users.find((user) => user.id() === id);
  }

  findByNickname(nickname: string): User | undefined {
    return this.users.find((user) => user.nickname() === nickname);
  }
}
