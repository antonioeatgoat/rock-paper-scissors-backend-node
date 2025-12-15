import { Injectable, Logger } from '@nestjs/common';
import { Game } from '../game/game';
import { ResponseBuilderService } from './response-builder.service';
import { Socket } from 'socket.io';
import { Player } from '../player/player';
import { GenericSocketError } from '../socket-errors/generic-socket.error';
import { EmittedWebsocketEvent as Event } from '../enums/emitted-websocket-event.enum';
import { PlayerSessionService } from './player-session.service';

@Injectable()
export class GatewayEmitterService {
  private readonly logger = new Logger(GatewayEmitterService.name);

  constructor(
    private readonly responseBuilder: ResponseBuilderService,
    private readonly playerSession: PlayerSessionService,
  ) {}

  emitGameJoined(game: Game, receiver: Player | null = null): void {
    for (const player of game.players()) {
      if (receiver && receiver.id() !== player.id()) {
        continue;
      }

      this.emitToPlayer(
        player,
        Event.GAME_JOINED,
        this.responseBuilder.connectNewGame(game, player),
      );
    }
  }

  emitWaitingForOpponent(player: Player): void {
    this.emitToPlayer(player, Event.WAITING_FOR_OPPONENT);
  }

  emitGameFinished(game: Game): void {
    for (const player of game.players()) {
      this.emitToPlayer(
        player,
        Event.GAME_FINISHED,
        this.responseBuilder.gameFinished(game, player),
      );
    }
  }

  emitError(client: Socket, error: GenericSocketError): void {
    const eventName = Event.ERROR;
    this.logger.debug(
      'WebSocket emits: ' + eventName,
      'Socket ID: ' + client.id,
      { error: error.message() },
    );

    client.emit(eventName, this.responseBuilder.error(error));
  }

  private logDebug(event: string, player: Player, data: any = {}): void {
    this.logger.debug(
      'WebSocket emits: ' + event,
      'Player ID: ' + player.id(),
      JSON.parse(JSON.stringify(data)),
    );
  }

  private emitToPlayer(player: Player, event: string, data: any = {}) {
    const playerWithMeta = this.playerSession.getPlayerWithMeta(player.id());

    this.logDebug(event, playerWithMeta.shrink(), data);
    playerWithMeta.client().emit(event, data);
  }
}
