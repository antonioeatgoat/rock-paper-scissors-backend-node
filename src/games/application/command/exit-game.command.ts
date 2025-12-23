import { Player } from '@/games/domain/player/player';

export class ExitGameCommand {
  constructor(public readonly player: Player) {}
}
