import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/user/user';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  register(registerDto: RegisterDto): string {
    if (
      this.usersService.findByNickname(registerDto.nickname) instanceof User
    ) {
      throw new ConflictException(
        `User with nickname ${registerDto.nickname} already exists.`,
      );
    }

    const user = this.usersService.create(registerDto.nickname);
    this.usersService.storeUser(user);

    return this.jwtService.sign({
      sub: user.id(),
    } as JwtPayload);
  }
}
