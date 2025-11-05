import { getLogger } from '../utils/logger';
import { CommandModule } from '../types/modules';

const log = getLogger('commands:webhook');

const webhookCommand: CommandModule = {
  name: 'webhook',
  description: 'Kirim pesan ke URL webhook yang dikonfigurasi.',
  run: async (client, message, args) => {
    const text = args.join(' ');
    if (!text) return message.channel.send('Usage: <@me> webhook <message>');
    const url = process.env.WEBHOOK_URL;
    if (!url) return message.channel.send('Webhook URL belum diset di .env');

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      log.info({ url }, 'Webhook dispatched');
      message.channel.send('Webhook sent ✅');
    } catch (err) {
      log.error({ err }, 'Failed to send webhook');
      message.channel.send('Failed to send webhook.');
    }
  },
};

export default webhookCommand;
