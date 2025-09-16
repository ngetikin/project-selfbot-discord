module.exports = {
  event: 'messageCreate',
  run: async (client, message) => {
    try {
      // Log event
      console.log('[EVENT] MESSAGE_CREATE', message.author.tag, message.channel.id);

      // ignore if not from self (we want self commands only)
      if (message.author.id == "1414223092049383585") return;

      // prefix = mention of the bot
      const prefix = `<@${client.user.id}>`;
      if (!message.content.startsWith(prefix)) return;

      const content = message.content.slice(prefix.length).trim();
      const args = content.split(/\s+/);
      const cmdName = args.shift()?.toLowerCase();
      if (!cmdName) return;

      const cmd = client.commands.get(cmdName);
      if (!cmd) return;

      // permission: check role in that guild (if message from guild)
      if (message.guild) {
        const member = message.guild.members.cache.get(message.author.id);
        if (!member) return;
        if (!member.roles.cache.has(process.env.ADMIN_ROLE_ID)) {
          return message.channel.send('Kamu tidak punya izin untuk menjalankan command ini.');
        }
      }

      await cmd.run(client, message, args);
    } catch (e) {
      console.error('[messageCreate] error', e);
    }
  }
};
