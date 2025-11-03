import { CommandModule } from '../types/modules';

const clearCommand: CommandModule = {
  name: 'clear',
  run: async (client, message, args) => {
    // Usage:
    // <@me> remove <count>  -> delete last <count> messages from the bot itself in the channel (or messages by others if privileged)
    const count = Number.parseInt(args[0] ?? '', 10) || 1;
    if (count < 1 || count > 100) return message.channel.send('Count must be between 1 and 100');

    // fetch messages and bulk delete (note: Discord API may not allow bulk delete depending on message age)
    const fetched = await message.channel.messages.fetch({ limit: Math.min(100, count + 5) });
    // filter messages by author id (bot) to avoid mass deleting others (adjust if needed)
    const toDelete = fetched.filter(m => m.author.id === client.user.id).first(count);
    if (!toDelete || toDelete.length === 0)
      return message.channel.send('No messages found to remove.');
    try {
      for (const m of toDelete) {
        await m.delete();
      }
      await message.channel
        .send(`Removed ${toDelete.length} messages.`)
        .then(m => setTimeout(() => m.delete(), 3000));
    } catch (err) {
      console.error('[remove] error', err);
      message.channel.send('Failed to remove messages: ' + (err.message || err));
    }
  },
};

export default clearCommand;
