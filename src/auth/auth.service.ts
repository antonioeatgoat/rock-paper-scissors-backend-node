import {
  ConflictException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { Response } from 'express';
import sanitizeHtml from 'sanitize-html';

import { RegisterDto } from '@/auth/dto/register.dto';
import { AccessTokenService } from '@/auth/services/AccessTokenService';
import { User } from '@/users/user/user';
import { UsersRepositoryService } from '@/users/users-repository.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepositoryService,
    private readonly accessTokenService: AccessTokenService,
  ) {}

  async register(res: Response, registerDto: RegisterDto): Promise<boolean> {
    // TODO in case `class-validator` and `class-transformer` will be introduced in future
    //  then these validation must be handled with decorators.
    if (registerDto.nickname.trim() === '') {
      throw new NotAcceptableException('Nickname cannot be empty.');
    }

    const sanitizedNickname = sanitizeHtml(registerDto.nickname.trim());
    if (sanitizedNickname === '') {
      throw new NotAcceptableException(
        'Nickname seems to contain unexpected values.',
      );
    }

    if (sanitizedNickname.length > 20) {
      throw new NotAcceptableException(
        'Nickname cannot be longer than 12 characters.',
      );
    }

    await this.usersRepository
      .findByNickname(sanitizedNickname)
      .then((user) => {
        if (user !== null) {
          throw new ConflictException(
            `User with nickname ${sanitizedNickname} already exists.`,
          );
        }
      });

    // TODO use a Factory or a Builder
    const user = new User(sanitizedNickname);
    await this.usersRepository.save(user);
    const token = this.accessTokenService.generateAccessToken(user);

    this.accessTokenService.storeAccessTokenInSession(res, token);

    return true;
  }
}
