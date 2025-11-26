import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/user/user';
import { AccessTokenService } from './services/AccessTokenService';
import { Response } from 'express';
import { UsersRepositoryService } from '../users/users-repository.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepositoryService,
    private readonly accessTokenService: AccessTokenService,
  ) {}

  async register(res: Response, registerDto: RegisterDto): Promise<boolean> {
    await this.usersRepository
      .findByNickname(registerDto.nickname)
      .then((user) => {
        if (user !== null) {
          throw new ConflictException(
            `User with nickname ${registerDto.nickname} already exists.`,
          );
        }
      });

    // TODO use a Factory or a Builder
    const user = new User(registerDto.nickname);
    await this.usersRepository.save(user);
    const token = this.accessTokenService.generateAccessToken(user);

    this.accessTokenService.storeAccessTokenInSession(res, token);

    return true;
  }
}
