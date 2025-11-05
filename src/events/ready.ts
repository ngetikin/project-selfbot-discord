import { RichPresence, CustomStatus, SpotifyRPC } from 'discord.js-selfbot-v13';
import { getLogger } from '../utils/logger';
import { EventModule } from '../types/modules';

const log = getLogger('events:ready');

const readyEvent: EventModule = {
  event: 'ready',
  run: async client => {
    log.info({ user: client.user.tag, id: client.user.id }, 'Ready event fired');

    if (process.env.VOICE_CHANNEL_ID) {
      const channel = client.channels.cache.get(process.env.VOICE_CHANNEL_ID);
      if (channel) {
        try {
          await client.voice.joinChannel(channel, {
            selfMute: true,
            selfDeaf: true,
            selfVideo: false,
          });
          log.info({ channelId: process.env.VOICE_CHANNEL_ID }, 'Joined voice channel');
        } catch (e: any) {
          log.error({ err: e }, 'Error joining voice channel');
        }
      } else {
        log.warn({ channelId: process.env.VOICE_CHANNEL_ID }, 'Voice channel not found in cache');
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
        log.info('Status rotator initialized');
      } catch (err) {
        log.error({ err }, 'Status rotator error');
      }
    }
  },
};

export default readyEvent;
