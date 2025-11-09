import type {
  Client as BaseClient,
  ClientEvents,
  Collection,
  Message,
} from 'discord.js-selfbot-v13';

export interface SelfbotClient<Ready extends boolean = boolean> extends BaseClient<Ready> {
  commands: Collection<string, CommandModule>;
}

export interface CommandModule {
  name: string;
  description?: string;
  run: (client: SelfbotClient, message: Message, args: string[]) => Promise<void> | void;
}

type SupportedEvents = 'messageCreate' | 'ready' | 'raw';

export interface EventModule<K extends SupportedEvents = SupportedEvents> {
  event: K;
  run: (client: SelfbotClient, ...args: ClientEvents[K]) => Promise<void> | void;
}
