import { Injectable, Logger } from '@nestjs/common';
import { Game } from '../game/game';
import { ResponseSerializerService } from './response-serializer.service';
import { Socket } from 'socket.io';
import { Player } from '../player/player';
import { PlayersSocketMapper } from './players-socket-mapper.service';
import { GenericSocketError } from '../socket-errors/generic-socket.error';

@Injectable()
export class GatewayEmitterService {
  private readonly logger = new Logger(GatewayEmitterService.name);

  constructor(
    private readonly socketMapper: PlayersSocketMapper,
    private readonly responseSerializer: ResponseSerializerService,
  ) {}

  emitGameStarted(game: Game): void {
    for (const player of game.players()) {
      this.emitToPlayer(
        player,
        'game_started',
        this.responseSerializer.connectNewGame(game, player),
      );
    }
  }

  emitGameRejoined(game: Game, player: Player): void {
    this.emitToPlayer(
      player,
      'game_rejoined',
      this.responseSerializer.connectExistingGame(game, player),
    );
  }

  emitWaitingForOpponent(player: Player): void {
    this.emitToPlayer(player, 'waiting_for_opponent');
  }

  emitGameFinished(game: Game): void {
    for (const player of game.players()) {
      this.emitToPlayer(
        player,
        'game_finished',
        this.responseSerializer.gameFinished(game, player),
      );
    }
  }

  emitError(client: Socket, error: GenericSocketError): void {
    const eventName = 'error';
    this.logger.debug(
      'WebSocket emits: ' + eventName,
      'Socket ID: ' + client.id,
      { error: error.message() },
    );

    client.emit(eventName, this.responseSerializer.error(error));
  }

  private logDebug(event: string, player: Player, data: any = {}): void {
    this.logger.debug(
      'WebSocket emits: ' + event,
      'Player ID: ' + player.id,
      JSON.parse(JSON.stringify(data)),
    );
  }

  private emitToPlayer(player: Player, event: string, data: any = {}) {
    this.logDebug(event, player, data);

    const socket = this.socketMapper.getSocket(player);

    if (socket === undefined) {
      this.logger.error('There is no socket stored for the given user');
      return;
    }

    socket.emit(event, data);
  }
}
