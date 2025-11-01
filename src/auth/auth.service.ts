import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/user/user';
import { AccessTokenService } from './services/AccessTokenService';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly accessTokenService: AccessTokenService,
  ) {}

  register(res: Response, registerDto: RegisterDto): boolean {
    if (
      this.usersService.findByNickname(registerDto.nickname) instanceof User
    ) {
      throw new ConflictException(
        `User with nickname ${registerDto.nickname} already exists.`,
      );
    }

    const user = this.usersService.create(registerDto.nickname);
    this.usersService.storeUser(user);
    const token = this.accessTokenService.generateAccessToken(user);

    this.accessTokenService.storeAccessTokenInSession(res, token);

    return true;
  }
}
