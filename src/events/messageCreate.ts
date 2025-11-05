import { CommandModule, EventModule } from '../types/modules';

const messageCreateEvent: EventModule = {
  event: 'messageCreate',
  run: async (client, message) => {
    try {
      // Log event
      const authorTag = message?.author?.tag ?? 'unknown';
      console.log('[EVENT] MESSAGE_CREATE', authorTag, message.channel.id);

      // Ignore messages without an author or while client user not ready
      if (!message.author || !client.user) {
        console.warn('[messageCreate] Missing message author or client user not ready.');
        return;
      }

      // Only respond to messages sent by this selfbot account
      if (message.author.id !== client.user.id) return;

      // prefix = mention of the bot
      const prefixes = [`<@${client.user.id}>`, `<@!${client.user.id}>`];
      const prefix = prefixes.find(p => message.content.startsWith(p));
      if (!prefix) return;

      const content = message.content.slice(prefix.length).trim();
      const args = content.split(/\s+/);
      const cmdName = args.shift()?.toLowerCase();
      if (!cmdName) return;

      const commands = client.commands as Map<string, CommandModule> | undefined;
      if (!commands) {
        console.warn('[messageCreate] Commands collection not initialized.');
        return;
      }

      const cmd = commands.get(cmdName);
      if (!cmd) return;

      // permission: check role in that guild (if message from guild)
      const adminRoleId = process.env.ADMIN_ROLE_ID;
      if (message.guild && adminRoleId) {
        const member = message.guild.members.cache.get(message.author.id);
        if (!member) return;
        const roleCache = member.roles?.cache;
        if (!roleCache || !roleCache.has(adminRoleId)) {
          await message.channel.send('Kamu tidak punya izin untuk menjalankan command ini.');
          return;
        }
      }

      await cmd.run(client, message, args);
    } catch (e) {
      console.error('[messageCreate] error', e);
    }
  },
};

export default messageCreateEvent;
