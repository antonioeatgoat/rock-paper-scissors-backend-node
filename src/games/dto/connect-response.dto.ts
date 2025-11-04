import { Game } from '../game/game';
import { ConnectStatus } from '../enums/connect-status.enum';
import { Player } from '../player/player';

export type ConnectResponseDto =
  | {
      status: Exclude<ConnectStatus, ConnectStatus.WAITING>;
      currentPlayer: Player;
      game: Game;
    }
  | {
      status: ConnectStatus.WAITING;
      currentPlayer: Player;
      game?: undefined;
    };
