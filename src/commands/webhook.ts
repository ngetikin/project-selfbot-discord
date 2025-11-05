import { CommandModule } from '../types/modules';

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
      message.channel.send('Webhook sent ✅');
    } catch (err) {
      console.error('[webhook] error', err);
      message.channel.send('Failed to send webhook.');
    }
  },
};

export default webhookCommand;
