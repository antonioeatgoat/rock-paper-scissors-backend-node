import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AccessTokenService } from '../services/AccessTokenService';
import { RequestWithUser } from '../interfaces/request-with-user';
import { SocketWithUser } from '../interfaces/socket-with-user';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private readonly accessTokenService: AccessTokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const type = context.getType();

    switch (type) {
      case 'http':
        this.authenticateHttp(context);
        break;
      case 'ws':
        this.authenticateWs(context);
        break;
      default:
        return false;
    }

    return true;
  }

  private authenticateHttp(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const user = this.accessTokenService.extractUserFromHttpRequest(request);

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    request.user = user;
  }

  private authenticateWs(context: ExecutionContext) {
    const client = context.switchToWs().getClient<SocketWithUser>();

    const user = this.accessTokenService.extractUserFromWsClient(client);

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    client.user = user;
  }
}
