import { Socket } from 'socket.io';

import { AllowedMove } from '@/games/domain/game/allowed-move.enum';
import { Player } from '@/games/domain/player/player';

export class SelectMoveCommand {
  constructor(
    public readonly socket: Socket,
    public readonly player: Player,
    public readonly move: AllowedMove,
  ) {}
}
