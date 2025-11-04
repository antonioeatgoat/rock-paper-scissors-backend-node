import { Injectable, Logger } from '@nestjs/common';
import { Player } from '../player/player';
import { User } from '../../users/user/user';
import { MatchmakingService } from './matchmaking.service';
import { Socket } from 'socket.io';
import { ConnectResponseDto } from '../dto/connect-response.dto';
import { ConnectStatus } from '../enums/connect-status.enum';
import { PlayerStatus } from '../player/player-status.enum';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(private readonly matchmaking: MatchmakingService) {}

  connectUser(user: User, client: Socket): ConnectResponseDto {
    const existingPlayer = this.matchmaking.retrievePlayer(user.id());

    if (existingPlayer instanceof Player) {
      this.logger.debug(
        'Retrieved existing player.',
        instanceToPlain(existingPlayer),
      );
      const existingGame = this.matchmaking.currentGameOfPlayer(existingPlayer);
      if (existingGame) {
        this.logger.debug(
          'Retrieved exisitng game.',
          instanceToPlain(existingGame),
        );
        return {
          status: ConnectStatus.JOINED_EXISTING,
          currentPlayer: existingPlayer,
          game: existingGame,
        };
      }

      return {
        status: ConnectStatus.WAITING,
        currentPlayer: existingPlayer,
      };
    }

    const newPlayer = new Player(
      user.id(),
      user.nickname(),
      PlayerStatus.WAITING,
      client,
    );

    this.matchmaking.storePlayer(newPlayer);

    const opponent = this.matchmaking.findOpponent(newPlayer);

    if (opponent === undefined) {
      return {
        status: ConnectStatus.WAITING,
        currentPlayer: newPlayer,
      };
    }

    // If not: create game for user and then join.
    const newGame = this.matchmaking.createNewGameForPlayers([
      newPlayer,
      opponent,
    ]);

    return {
      status: ConnectStatus.NEW,
      currentPlayer: newPlayer,
      game: newGame,
    };
  }
}
