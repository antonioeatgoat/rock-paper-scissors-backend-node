import { AllowedMove } from '../enums/allowed-move.enum';
import { GameStatus } from '../enums/game-status.enum';
import { Player } from '../player/player';

import { PlayerMove } from './player-move.interface';

export class Game {
  private readonly _id: string = crypto.randomUUID();
  private _status: GameStatus = GameStatus.PLAYING;
  private _moves: Map<string, AllowedMove> = new Map();

  constructor(private readonly _players: [Player, Player]) {}

  id(): string {
    return this._id;
  }

  players(): Player[] {
    return this._players;
  }

  hasPlayer(player: Player | string) {
    const playerID = player instanceof Player ? player.id() : player;

    return (
      this._players[0].id() === playerID || this._players[1].id() === playerID
    );
  }

  status(): GameStatus {
    return this._status;
  }

  opponentOf(player: Player) {
    if (this._players[0].id() === player.id()) {
      return this._players[1];
    }

    if (this._players[1].id() === player.id()) {
      return this._players[0];
    }

    throw new Error('This player is not in this game');
  }

  addMove(playerMove: PlayerMove): void {
    if (this.isFinished()) {
      throw new Error('Both players already moved in this game');
    }

    if (!this.hasPlayer(playerMove.player)) {
      throw new Error('This player is not in this game');
    }

    this._moves.set(playerMove.player.id(), playerMove.move);

    if (this._moves.size === 2) {
      this._status = GameStatus.ENDED;
    }
  }

  moveOf(player: Player): AllowedMove | null {
    return this._moves.get(player.id()) ?? null;
  }

  isFinished(): boolean {
    return this._status === GameStatus.ENDED;
  }

  theWinner(): Player | null {
    const [p1, p2] = this._players;

    const m1 = this._moves.get(p1.id());
    const m2 = this._moves.get(p2.id());

    if (!m1 || !m2 || m1 === m2) {
      return null;
    }

    if (
      (m1 === AllowedMove.ROCK && m2 === AllowedMove.SCISSORS) ||
      (m1 === AllowedMove.PAPER && m2 === AllowedMove.ROCK) ||
      (m1 === AllowedMove.SCISSORS && m2 === AllowedMove.PAPER)
    ) {
      return p1;
    }

    return p2;
  }

  toJSON() {
    return {
      id: this._id,
      status: this._status,
      players: [this._players[0].toJSON(), this._players[1].toJSON()],
      moves: this._moves,
      winner: this.theWinner()?.toJSON(),
    };
  }
}
