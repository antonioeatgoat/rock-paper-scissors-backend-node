import { Injectable } from '@nestjs/common';
import { Player } from '../player/player';
import { Game } from '../game/game';
import { GamesRepositoryService } from './games-repository.service';
import { GameStatus } from '../game/game-status';
import { PlayerStatus } from '../player/player-status.enum';

@Injectable()
export class MatchmakingService {
  private readonly players: Player[] = []; // TODO Convert to Map

  constructor(private readonly repository: GamesRepositoryService) {}

  insertPlayer(player: Player) {
    this.players.push(player);
  }

  updatePlayer(player: Player): boolean {
    const index = this.players.findIndex((g) => g.id === player.id);
    if (index === -1) {
      return false;
    }

    this.players[index] = player;
    return true;
  }

  retrievePlayer(playerId: string): Player | undefined {
    return this.players.find((player) => player.id === playerId);
  }

  currentGameOfPlayer(player: Player): Game | undefined {
    const games = this.repository.findByPlayer(player);

    return games.find((game) => game.status() === GameStatus.PLAYING);
  }

  findOpponent(player: Player): Player | undefined {
    return this.players.find(
      (p: Player) => p.status === PlayerStatus.WAITING && player.id !== p.id,
    );
  }

  createNewGameForPlayers(players: [Player, Player]): Game {
    for (const player of players) {
      player.status = PlayerStatus.PLAYING;
      this.updatePlayer(player);
    }

    const newGame = new Game(players);

    this.repository.insert(newGame);

    return newGame;
  }
}
