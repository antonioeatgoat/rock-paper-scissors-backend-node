import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/user/user';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {
  }

  register(registerDto: RegisterDto): User {
    const user = new User(registerDto.nickname);

    if (
      this.usersService.findByNickname(registerDto.nickname) instanceof User
    ) {
      throw new ConflictException(
        `User with nickname ${registerDto.nickname} already exists.`,
      );
    }

    this.usersService.storeUser(user);

    return user;
  }
}
