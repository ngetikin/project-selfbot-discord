import { getLogger } from '../utils/logger';
import { CommandModule } from '../types/modules';

const log = getLogger('commands:clear');

const hasCatch = (
  value: unknown,
): value is { catch: (onRejected: (reason: unknown) => unknown) => unknown } =>
  Boolean(
    value &&
      typeof value === 'object' &&
      'catch' in value &&
      typeof (value as { catch: unknown }).catch === 'function',
  );

const clearCommand: CommandModule = {
  name: 'clear',
  description: 'Hapus pesan milik akun selfbot di channel sekarang (1–100).',
  run: async (client, message, args) => {
    if (!client.user) {
      log.warn('Client user not ready for clear command.');
      return;
    }

    // Usage:
    // <@me> remove <count>  -> delete last <count> messages from the bot itself in the channel (or messages by others if privileged)
    const count = Number.parseInt(args[0] ?? '', 10) || 1;
    if (count < 1 || count > 100) {
      await message.channel.send('Count must be between 1 and 100');
      return;
    }

    // fetch messages and bulk delete (note: Discord API may not allow bulk delete depending on message age)
    const fetched = await message.channel.messages.fetch({ limit: Math.min(100, count + 5) });
    // filter messages by author id (bot) to avoid mass deleting others (adjust if needed)
    const filtered = fetched.filter(m => m.author.id === client.user.id);
    const toDelete = filtered.first(count);
    if (!toDelete || toDelete.length === 0) {
      await message.channel.send('No messages found to remove.');
      return;
    }

    const messagesToDelete = Array.isArray(toDelete) ? toDelete : [toDelete];
    try {
      for (const m of messagesToDelete) {
        await m.delete();
      }
      const confirmation = await message.channel.send(
        `Removed ${messagesToDelete.length} messages.`,
      );
      setTimeout(() => {
        try {
          const deletionResult = confirmation.delete?.();
          if (hasCatch(deletionResult)) {
            deletionResult.catch(err => {
              log.error({ err }, 'Failed to delete confirmation message');
            });
          }
        } catch (err) {
          log.error({ err }, 'Failed to delete confirmation message');
        }
      }, 3000);
    } catch (err) {
      log.error({ err }, 'Failed to remove messages');
      const errorMessage =
        err instanceof Error ? err.message : typeof err === 'string' ? err : 'Unknown error';
      await message.channel.send(`Failed to remove messages: ${errorMessage}`);
    }
  },
};

export default clearCommand;
