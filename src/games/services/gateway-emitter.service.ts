import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

import { EmittedWebsocketEvent as Event } from '../enums/emitted-websocket-event.enum';
import { Game } from '../game/game';
import { Player } from '../player/player';
import { GenericSocketError } from '../socket-errors/generic-socket.error';

import { PlayerSessionService } from './player-session.service';
import { ResponseBuilderService } from './response-builder.service';

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

  emitGameLeft(game: Game, playerWhoLeft: Player): void {
    this.emitToPlayer(
      game.opponentOf(playerWhoLeft),
      Event.GAME_FINISHED,
      this.responseBuilder.opponentLeft(game, game.opponentOf(playerWhoLeft)),
    );
  }

  emitError(client: Socket, error: GenericSocketError): void {
    this.logger.debug('WebSocket error', {
      error: error.message(),
      socket: client.id,
    });

    client.emit('error', this.responseBuilder.error(error));
  }

  private emitToPlayer(player: Player, event: string, data: any = {}) {
    const playerWithMeta = this.playerSession.getPlayerWithMeta(player.id());

    this.logger.debug(`WebSocket emits: ${event}`, {
      player: player.id(),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: JSON.parse(JSON.stringify(data)),
    });

    playerWithMeta.client().emit(event, data);
  }
}
