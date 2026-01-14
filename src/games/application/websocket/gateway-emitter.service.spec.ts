import { Test, TestingModule } from '@nestjs/testing';

import { PlayerSessionService } from '@/games/application/services/player-session.service';
import { EmittedWebsocketEvent as Event } from '@/games/application/websocket/enums/emitted-websocket-event.enum';
import { GatewayEmitterService } from '@/games/application/websocket/gateway-emitter.service';
import { ResponseBuilderService } from '@/games/application/websocket/response-builder.service';
import { Game } from '@/games/domain/game/game';
import { Player } from '@/games/domain/player/player';

describe('GatewayEmitterService', () => {
  const player1 = new Player('p1', 'Alice');
  const player2 = new Player('p2', 'Bob');

  let service: GatewayEmitterService;

  const responseBuilder = {
    connectNewGame: jest.fn(),
    gameFinished: jest.fn(),
    opponentLeft: jest.fn(),
    error: jest.fn(),
  };

  const playerSession = {
    getSocket: jest.fn(),
  };

  const createSocket = () => ({ emit: jest.fn() });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GatewayEmitterService,
        { provide: ResponseBuilderService, useValue: responseBuilder },
        { provide: PlayerSessionService, useValue: playerSession },
      ],
    }).compile();

    service = module.get<GatewayEmitterService>(GatewayEmitterService);
    jest.clearAllMocks();
  });

  it('emits GAME_JOINED to both players', () => {
    const game = new Game([player1, player2]);

    const socketA = createSocket();
    const socketB = createSocket();

    playerSession.getSocket.mockImplementation((player: Player) =>
      player.id() === player1.id() ? socketA : socketB,
    );

    responseBuilder.connectNewGame.mockImplementation(
      (_: Game, player: Player) => ({
        opponent: player.id() === player1.id() ? 'Bob' : 'Alice',
      }),
    );

    service.emitGameJoined(game);

    expect(socketA.emit).toHaveBeenCalledWith(Event.GAME_JOINED, {
      opponent: 'Bob',
    });
    expect(socketB.emit).toHaveBeenCalledWith(Event.GAME_JOINED, {
      opponent: 'Alice',
    });
  });

  it('emits WAITING_FOR_OPPONENT to a player', () => {
    const socket = createSocket();

    playerSession.getSocket.mockReturnValue(socket);

    service.emitWaitingForOpponent(player1);

    expect(socket.emit).toHaveBeenCalledWith(Event.WAITING_FOR_OPPONENT, {});
  });

  it('emits GAME_FINISHED to opponent when a player leaves', () => {
    const game = new Game([player1, player2]);

    const socketB = createSocket();

    playerSession.getSocket.mockReturnValue(socketB);
    responseBuilder.opponentLeft.mockReturnValue({ result: 'opponent_left' });

    service.emitGameLeft(game, player1);

    expect(socketB.emit).toHaveBeenCalledWith(Event.GAME_FINISHED, {
      result: 'opponent_left',
    });
  });
});
