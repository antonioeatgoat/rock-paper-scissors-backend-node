import { Socket } from 'socket.io';
import { User } from '../../users/user/user';

export interface SocketWithUser extends Socket {
  user: User | undefined;
}
