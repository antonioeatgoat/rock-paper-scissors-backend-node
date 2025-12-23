export interface CommandHandler<C> {
  execute(command: C): Promise<void>;
}
