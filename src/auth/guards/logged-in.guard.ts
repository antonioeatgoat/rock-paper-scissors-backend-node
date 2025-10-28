import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../constants';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserRequest } from '../interfaces/user-request.interface';

@Injectable()
export class LoggedInGuard implements CanActivate {
  private readonly logger = new Logger(LoggedInGuard.name);

  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<UserRequest>();
    const token = this.extractToken(request);

    if (token === undefined) {
      throw new UnauthorizedException();
    }

    try {
      const jwtPayload = this.jwtService.verify<JwtPayload>(token, {
        secret: jwtConstants.secret,
      });

      request.user_id = jwtPayload.sub;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractToken(req: UserRequest): string | undefined {
    this.logger.debug('Extracting token from request.', {
      cookies: req.cookies,
    });

    // TODO Use the constant
    return req.cookies.token;
  }
}
