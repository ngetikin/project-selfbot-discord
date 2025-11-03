import { RichPresence, CustomStatus, SpotifyRPC } from 'discord.js-selfbot-v13';
import { EventModule } from '../types/modules';

const readyEvent: EventModule = {
  event: 'ready',
  run: async client => {
    console.log('[EVENT] READY');
    console.log(`[READY] Logged in as ${client.user.tag}`);

    if (process.env.VOICE_CHANNEL_ID) {
      const channel = client.channels.cache.get(process.env.VOICE_CHANNEL_ID);
      if (channel) {
        try {
          await client.voice.joinChannel(channel, {
            selfMute: true,
            selfDeaf: true,
            selfVideo: false,
          });
          console.log('[READY] Joined VC successfully.');
        } catch (e: any) {
          console.error('[READY] Error joining VC:', e?.message ?? e);
        }
      } else {
        console.warn('[READY] Voice channel not found in cache.');
      }
    }

    if (process.env.AUTO_STATUS_ROTATOR === 'true' || process.env.AUTO_STATUS_ROTATOR === '1') {
      try {
        const rp = new RichPresence(client)
          .setApplicationId('367827983903490050')
          .setName('osu!')
          .setDetails('Playing example')
          .setStartTimestamp(Date.now());

        const custom = new CustomStatus(client).setEmoji('😋').setState('yum');

        const spotify = new SpotifyRPC(client)
          .setAssetsLargeText('Album')
          .setState('Artist')
          .setDetails('Song')
          .setStartTimestamp(Date.now());

        client.user.setPresence({ activities: [rp, custom, spotify] });
        console.log('[READY] Status rotator initialized.');
      } catch (err) {
        console.error('[READY] Status rotator error:', err);
      }
    }
  },
};

export default readyEvent;
