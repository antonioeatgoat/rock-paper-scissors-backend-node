import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, LogLevel } from '@nestjs/common';
import cookieParser from 'cookie-parser';

const logLevels: LogLevel[] = ['fatal', 'error', 'warn', 'log'];
const enableDebugLog = process.env.NODE_ENV === undefined;
const enableVerboseLog = process.env.VERBOSE_LOGS === 'true';

if (enableDebugLog) {
  logLevels.push('debug');
}
if (enableVerboseLog) {
  logLevels.push('verbose');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger('App', {
      timestamp: true,
      logLevels: logLevels,
    }),
  });
  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
