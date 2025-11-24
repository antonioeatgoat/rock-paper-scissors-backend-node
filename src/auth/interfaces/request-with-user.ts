import type { Request } from 'express';
import { User } from '../../users/user/user';

export interface RequestWithUser extends Request {
  cookies: Record<string, string>;
  user: User;
}
