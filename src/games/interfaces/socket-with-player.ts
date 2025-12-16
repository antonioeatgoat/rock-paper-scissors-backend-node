import { SocketWithUser } from '@/auth/interfaces/socket-with-user';

import { PlayerWithMeta } from '../player/player-with-meta';

export interface SocketWithPlayer extends SocketWithUser {
  player: PlayerWithMeta | undefined;
}
