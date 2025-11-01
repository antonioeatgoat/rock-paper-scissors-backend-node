import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../users/user/user';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import type { Response } from 'express';
import { jwtConstants } from '../constants';
import { UsersService } from '../../users/users.service';
import { Socket } from 'socket.io';
import * as cookie from 'cookie';
import { RequestWithUser } from '../interfaces/request-with-user';

@Injectable()
export class AccessTokenService {
  static readonly COOKIE_NAME: string = 'access_token';
  static readonly COOKIE_EXPIRATION: number = 1000 * 60 * 60; // 1h

  private readonly logger = new Logger(AccessTokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  generateAccessToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id(),
    } as JwtPayload);
  }

  storeAccessTokenInSession(res: Response, token: string) {
    res.cookie(AccessTokenService.COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: AccessTokenService.COOKIE_EXPIRATION,
    });
  }

  extractUserFromHttpRequest(req: RequestWithUser): User {
    this.logger.debug('Extracting token from HTTP request.', {
      cookies: req?.cookies ?? [],
    });

    const token = req?.cookies?.[AccessTokenService.COOKIE_NAME] ?? '';

    return this.fetchUserFromToken(token);
  }

  // extractUserFromWsClient(client: Socket): User {
  extractUserFromWsClient(client: Socket): User {
    this.logger.debug('Extracting token from Websocket client.', {
      cookies: client?.handshake?.headers?.cookie ?? '',
    });

    const cookies = cookie.parse(client?.handshake?.headers?.cookie ?? '');

    return this.fetchUserFromToken(
      cookies[AccessTokenService.COOKIE_NAME] ?? '',
    );
  }

  private fetchUserFromToken(token: string): User {
    let jwtPayload;
    try {
      jwtPayload = this.jwtService.verify<JwtPayload>(token, {
        secret: jwtConstants.secret,
      });
    } catch {
      this.logger.debug('Error while verifying the token.', { token: token });
      throw new Error();
    }

    const user = this.usersService.findById(jwtPayload.sub);

    if (user === undefined) {
      this.logger.debug('Impossible to find an user.', { id: jwtPayload.sub });
      throw new Error();
    }

    return user;
  }
}
