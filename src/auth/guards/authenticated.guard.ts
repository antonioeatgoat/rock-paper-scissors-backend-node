import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { RequestWithUser } from '../interfaces/request-with-user';
import { SocketWithUser } from '../interfaces/socket-with-user';
import { AccessTokenService } from '../services/AccessTokenService';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private readonly accessTokenService: AccessTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const type = context.getType();

    switch (type) {
      case 'http':
        await this.authenticateHttp(context);
        break;
      case 'ws':
        await this.authenticateWs(context);
        break;
      default:
        return false;
    }

    return true;
  }

  private async authenticateHttp(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    await this.accessTokenService
      .extractUserFromHttpRequest(request)
      .then((user) => {
        if (user === null) {
          throw new UnauthorizedException();
        }

        request.user = user;
      });
  }

  private async authenticateWs(context: ExecutionContext) {
    const client = context.switchToWs().getClient<SocketWithUser>();

    await this.accessTokenService
      .extractUserFromWsClient(client)
      .then((user) => {
        if (user === null) {
          throw new UnauthorizedException();
        }

        client.user = user;
      });
  }
}
