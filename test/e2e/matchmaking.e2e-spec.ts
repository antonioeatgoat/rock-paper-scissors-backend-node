import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { io, Socket } from 'socket.io-client';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '@/app.module';

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

async function waitForPlayingStatus(
  app: INestApplication<App>,
  cookie: string,
  expectedOpponent: string,
) {
  const maxAttempts = 10;
  const delayMs = 100;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await request(app.getHttpServer())
      .get('/games/current-game')
      .set('Cookie', cookie);

    if (
      response.status === 200 &&
      response.body?.status === 'playing' &&
      response.body?.opponent === expectedOpponent
    ) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error('Game did not reach playing state in time.');
}

describe('WebSocket matchmaking (e2e) - two players', () => {
  let app: INestApplication<App>;
  let serverUrl: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
    const address = (await app.listen(0)).address();
    serverUrl =
      typeof address === 'string'
        ? address
        : `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  it('matches two players and returns playing status for both', async () => {
    // 1) Register user A
    const registerA = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ nickname: 'Alice' })
      .expect(200);
    const cookieA = registerA.headers['set-cookie']?.[0];

    // 2) Connect user A to websocket
    const socketA: Socket = io(serverUrl, {
      transports: ['websocket'],
      extraHeaders: { Cookie: cookieA },
    });
    await new Promise<void>((resolve, reject) => {
      socketA.on('connect', () => resolve());
      socketA.on('connect_error', (err) => reject(err));
    });

    // 3) User A searches for opponent
    socketA.emit('search_game');

    // 4) Register user B
    const registerB = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ nickname: 'Bob' })
      .expect(200);
    const cookieB = registerB.headers['set-cookie']?.[0];

    // 5) Connect user B to websocket
    const socketB: Socket = io(serverUrl, {
      transports: ['websocket'],
      extraHeaders: { Cookie: cookieB },
    });
    await new Promise<void>((resolve, reject) => {
      socketB.on('connect', () => resolve());
      socketB.on('connect_error', (err) => reject(err));
    });

    // 6) User B searches for opponent
    socketB.emit('search_game');

    // 7) Verify both users are now playing with each other
    await waitForPlayingStatus(app, cookieA, 'Bob');
    await waitForPlayingStatus(app, cookieB, 'Alice');

    socketA.disconnect();
    socketB.disconnect();
  });
});
