import dotenv from 'dotenv';
import { Client, Collection } from 'discord.js-selfbot-v13';
import type { ClientEvents } from 'discord.js-selfbot-v13';
import fs from 'fs';
import path from 'path';
import { CommandModule, EventModule, SelfbotClient } from './types/modules';
import logger, { getLogger } from './utils/logger';
import validateEnv from './utils/validateEnv';

dotenv.config();

const { errors: envErrors, warnings: envWarnings } = validateEnv(process.env);
if (envErrors.length > 0) {
  for (const message of envErrors) {
    logger.error({ message }, 'ENV validation error');
  }
  process.exit(1);
}

for (const warning of envWarnings) {
  logger.warn({ warning }, 'ENV validation warning');
}

const client = new Client({ checkUpdate: false }) as SelfbotClient;
client.commands = client.commands ?? new Collection<string, CommandModule>();
const appLogger = getLogger('app');

const loadModule = <T>(modulePath: string): T | null => {
  const imported = require(modulePath) as { default?: T } | T;
  if ((imported as { default?: T }).default) {
    return (imported as { default: T }).default;
  }
  return imported as T;
};

const filterModuleFiles = (files: string[]) =>
  files.filter(file => file.endsWith('.js') || file.endsWith('.ts'));

const registerEvent = <K extends keyof ClientEvents>(eventModule: EventModule<K>) => {
  client.on(eventModule.event, async (...args: ClientEvents[K]) => {
    await eventModule.run(client, ...args);
  });
};

const cmdsPath = path.join(__dirname, 'commands');
if (fs.existsSync(cmdsPath)) {
  const commandFiles = filterModuleFiles(fs.readdirSync(cmdsPath));
  appLogger.debug({ count: commandFiles.length }, 'Loading command modules');
  for (const file of commandFiles) {
    const modulePath = path.join(cmdsPath, file);
    const command = loadModule<CommandModule>(modulePath);
    if (command && command.name) {
      client.commands.set(command.name, command);
      appLogger.debug({ command: command.name }, 'Registered command');
    }
  }
}

const evPath = path.join(__dirname, 'events');
if (fs.existsSync(evPath)) {
  const eventFiles = filterModuleFiles(fs.readdirSync(evPath));
  appLogger.debug({ count: eventFiles.length }, 'Loading event modules');
  for (const file of eventFiles) {
    const modulePath = path.join(evPath, file);
    const event = loadModule<EventModule>(modulePath);
    if (event?.event) {
      appLogger.debug({ event: event.event }, 'Registered event handler');
      registerEvent(event);
    }
  }
}

client.once('ready', () => {
  if (!client.user) {
    appLogger.error('Client ready event emitted without user context.');
    return;
  }
  appLogger.info({ user: client.user.tag, id: client.user.id }, 'Client ready');
});

client
  .login(process.env.TOKEN)
  .then(() => appLogger.info('Login successful'))
  .catch(error => {
    appLogger.fatal({ err: error }, 'Failed to login to Discord');
    process.exit(1);
  });
