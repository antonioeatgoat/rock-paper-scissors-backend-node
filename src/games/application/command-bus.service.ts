import { Injectable } from '@nestjs/common';

import { CommandHandler } from '@/games/application/command/command-handler.interface';

@Injectable()
export class CommandBus {
  private handlers = new Map<string, CommandHandler<any>>();

  register<C>(commandName: string, handler: CommandHandler<C>) {
    this.handlers.set(commandName, handler);
  }

  async execute(command: object): Promise<void> {
    const handler = this.handlers.get(command.constructor.name);

    if (!handler) {
      throw new Error(`No handler for command ${command.constructor.name}`);
    }

    await handler.execute(command);
  }
}
