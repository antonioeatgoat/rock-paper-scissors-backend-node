import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../users/user/user';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import type { Response } from 'express';
import { Socket } from 'socket.io';
import * as cookie from 'cookie';
import { RequestWithUser } from '../interfaces/request-with-user';
import { ConfigService } from '@nestjs/config';
import { UsersRepositoryService } from '../../users/users-repository.service';

@Injectable()
export class AccessTokenService {
  private readonly cookieName: string = 'access_token';
  private readonly cookieExpiration: number = 1000 * 60 * 60; // 1h

  private readonly logger = new Logger(AccessTokenService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepositoryService,
  ) {}

  generateAccessToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id(),
    } as JwtPayload);
  }

  storeAccessTokenInSession(res: Response, token: string) {
    res.cookie(this.cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: this.cookieExpiration,
    });
  }

  extractUserFromHttpRequest(req: RequestWithUser): Promise<User | null> {
    this.logger.debug('Extracting token from HTTP request.', {
      cookies: req?.cookies ?? [],
    });

    const token = req?.cookies?.[this.cookieName] ?? '';

    return this.fetchUserFromToken(token);
  }

  extractUserFromWsClient(client: Socket): Promise<User | null> {
    this.logger.debug('Extracting token from Websocket client.', {
      cookies: client?.handshake?.headers?.cookie ?? '',
    });

    const cookies = cookie.parse(client?.handshake?.headers?.cookie ?? '');

    return this.fetchUserFromToken(cookies[this.cookieName] ?? '');
  }

  private async fetchUserFromToken(token: string): Promise<User | null> {
    let jwtPayload;
    try {
      jwtPayload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
    } catch {
      this.logger.debug('Error while verifying the token.', { token: token });
      return null;
    }

    const user = await this.usersRepository.findById(jwtPayload.sub);

    if (user === null) {
      this.logger.debug('Impossible to find an user.', { id: jwtPayload.sub });
    }

    return user;
  }
}
