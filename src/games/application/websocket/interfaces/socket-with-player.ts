import { SocketWithUser } from '@/auth/interfaces/socket-with-user';
import { Player } from '@/games/domain/player/player';

export interface SocketWithPlayer extends SocketWithUser {
  player: Player | undefined;
}
