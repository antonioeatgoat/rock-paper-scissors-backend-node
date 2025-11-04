import { Injectable, Logger } from '@nestjs/common';
import { Game } from '../game/game';
import { ResponseSerializerService } from './response-serializer.service';
import { Socket } from 'socket.io';
import { Player } from '../player/player';

@Injectable()
export class GatewayEmitterService {
  private readonly logger = new Logger(GatewayEmitterService.name);

  constructor(private readonly responseSerializer: ResponseSerializerService) {}

  emitGameStarted(game: Game): void {
    const eventName = 'game_started';
    this.logDebug(eventName, null, game);

    for (const player of game.players()) {
      player.socket.emit(
        eventName,
        this.responseSerializer.connectNewGame(game, player),
      );
    }
  }

  emitGameRejoined(game: Game, player: Player): void {
    const eventName = 'game_rejoined';
    this.logDebug(eventName, player.socket, game);

    player.socket.emit(
      eventName,
      this.responseSerializer.connectExistingGame(game, player),
    );
  }

  emitWaitingForOpponent(player: Player): void {
    const eventName = 'waiting_for_opponent';
    this.logDebug(eventName, player.socket);

    player.socket.emit(eventName);
  }

  emitError(client: Socket, message: string): void {
    const eventName = 'error';
    this.logDebug(eventName, client, { error: message });

    client.emit(eventName, this.responseSerializer.error(message));
  }

  private logDebug(event: string, socket: Socket | null, data: any = {}): void {
    this.logger.debug(
      'WebSocket emits: ' + event,
      'Socket ID: ' + socket?.id,
      JSON.parse(JSON.stringify(data))
    );
  }
}
