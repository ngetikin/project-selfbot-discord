import type { Message } from 'discord.js-selfbot-v13';
import { getLogger } from '../utils/logger';
import { EventModule } from '../types/modules';

const log = getLogger('events:messageCreate');

const messageCreateEvent: EventModule<'messageCreate'> = {
  event: 'messageCreate',
  run: async (client, message: Message) => {
    try {
      // Log event
      const authorTag = message?.author?.tag ?? 'unknown';
      log.debug({ authorTag, channelId: message?.channel?.id }, 'messageCreate received');

      // Ignore messages without an author or while client user not ready
      if (!message.author || !client.user) {
        log.warn('Missing message author or client user not ready.');
        return;
      }

      // Only respond to messages sent by this selfbot account
      if (message.author.id !== client.user.id) return;

      // prefix = mention of the bot atau prefix teks opsional
      const textPrefix = process.env.TEXT_PREFIX?.trim();
      const prefixes = [`<@${client.user.id}>`, `<@!${client.user.id}>`];
      if (textPrefix) {
        prefixes.push(textPrefix);
      }
      const prefix = prefixes.find(p => message.content.startsWith(p));
      if (!prefix) return;

      const content = message.content.slice(prefix.length).trim();
      const args = content.length > 0 ? content.split(/\s+/) : [];
      const cmdName = args.shift()?.toLowerCase();
      if (!cmdName) return;

      const cmd = client.commands.get(cmdName);
      if (!cmd) return;

      // permission: check role in that guild (if message from guild)
      const adminRoleId = process.env.ADMIN_ROLE_ID;
      if (message.guild && adminRoleId) {
        const membersManager = message.guild.members;
        let member = membersManager.cache.get(message.author.id);
        if (!member && typeof membersManager.fetch === 'function') {
          try {
            member = await membersManager.fetch(message.author.id);
          } catch (err) {
            log.warn({ err }, 'Failed to fetch member for permission check');
            return;
          }
        }

        if (!member) {
          log.warn('Member not found for permission check.');
          return;
        }

        const roleCache = member.roles?.cache;
        const hasRole =
          roleCache && typeof roleCache.has === 'function' ? roleCache.has(adminRoleId) : false;
        if (!hasRole) {
          await message.channel.send('Kamu tidak punya izin untuk menjalankan command ini.');
          log.warn({ authorId: message.author.id }, 'Permission denied for command execution');
          return;
        }
      }

      await cmd.run(client, message, args);
    } catch (e) {
      log.error({ err: e }, 'Unexpected error while handling messageCreate');
    }
  },
};

export default messageCreateEvent;
