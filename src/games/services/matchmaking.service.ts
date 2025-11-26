import { Injectable } from '@nestjs/common';
import { Player } from '../player/player';
import { Game } from '../game/game';
import { GameStatus } from '../game/game-status';
import { PlayerStatus } from '../player/player-status.enum';
import { GamesRepositoryService } from '../games-repository.service';

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

  async currentGameOfPlayer(player: Player): Promise<Game | undefined> {
    const games = await this.repository.findByPlayer(player);

    return games.find((game) => game.status() === GameStatus.PLAYING);
  }

  findOpponent(player: Player): Player | undefined {
    return this.players.find(
      (p: Player) => p.status === PlayerStatus.WAITING && player.id !== p.id,
    );
  }

  async createNewGameForPlayers(players: [Player, Player]): Promise<Game> {
    for (const player of players) {
      player.status = PlayerStatus.PLAYING;
      this.updatePlayer(player);
    }

    const newGame = new Game(players);

    await this.repository.insert(newGame);

    return newGame;
  }
}
