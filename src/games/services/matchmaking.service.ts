import { Injectable } from '@nestjs/common';
import { Player } from '../player/player';
import { Game } from '../game/game';
import { GamesRepositoryService } from './games-repository.service';
import { GameStatus } from '../game/game-status';
import { PlayerStatus } from '../player/player-status.enum';

@Injectable()
export class MatchmakingService {
  private readonly players: Player[] = [];

  constructor(private readonly repository: GamesRepositoryService) {}

  storePlayer(player: Player) {
    this.players.push(player);
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
    const newGame = new Game(players);

    this.repository.insert(newGame);

    return newGame;
  }
}
