import { AllowedMove } from '@/games/domain/game/allowed-move.enum';
import { Player } from '@/games/domain/player/player';

export interface PlayerMove {
  player: Player;
  move: AllowedMove;
}
