import { getLogger } from '../utils/logger';
import { CommandModule } from '../types/modules';

const log = getLogger('commands:webhook');

const webhookCommand: CommandModule = {
  name: 'webhook',
  description: 'Kirim pesan ke URL webhook yang dikonfigurasi.',
  run: async (client, message, args) => {
    const text = args.join(' ');
    if (!text) {
      await message.channel.send('Usage: <@me> webhook <message>');
      return;
    }
    const url = process.env.WEBHOOK_URL;
    if (!url) {
      await message.channel.send('Webhook URL belum diset di .env');
      return;
    }

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      log.info({ url }, 'Webhook dispatched');
      await message.channel.send('Webhook sent ✅');
    } catch (err) {
      log.error({ err }, 'Failed to send webhook');
      await message.channel.send('Failed to send webhook.');
    }
  },
};

export default webhookCommand;
