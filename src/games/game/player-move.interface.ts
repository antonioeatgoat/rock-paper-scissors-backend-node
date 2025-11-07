import { AllowedMove } from '../enums/allowed-move.enum';
import { Player } from '../player/player';

export interface PlayerMove {
  player: Player;
  move: AllowedMove;
}
