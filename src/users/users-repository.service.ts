import { User } from './user/user';

export abstract class UsersRepositoryService {
  abstract save(user: User): Promise<void>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByNickname(nickname: string): Promise<User | null>;
}
