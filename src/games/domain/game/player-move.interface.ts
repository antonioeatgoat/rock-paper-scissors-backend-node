import { Player } from '../player/player';

import { AllowedMove } from './allowed-move.enum';

export interface PlayerMove {
  player: Player;
  move: AllowedMove;
}
