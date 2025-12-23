import { Player } from '@/games/domain/player/player';

export class SearchGameCommand {
  constructor(public readonly player: Player) {}
}
