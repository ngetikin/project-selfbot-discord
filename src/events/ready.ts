import { CustomStatus, RichPresence, SpotifyRPC } from 'discord.js-selfbot-v13';
import type { AnyChannel, VoiceBasedChannel } from 'discord.js-selfbot-v13';
import { getLogger } from '../utils/logger';
import { EventModule } from '../types/modules';

const log = getLogger('events:ready');

const isVoiceBasedChannel = (channel: AnyChannel | null): channel is VoiceBasedChannel =>
  Boolean(channel) && 'bitrate' in (channel as VoiceBasedChannel);

const readyEvent: EventModule = {
  event: 'ready',
  run: async client => {
    const selfUser = client.user;
    if (!selfUser) {
      log.error('Client user missing during ready event.');
      return;
    }

    log.info({ user: selfUser.tag, id: selfUser.id }, 'Ready event fired');

    if (process.env.VOICE_CHANNEL_ID) {
      const cachedChannel = client.channels.cache.get(process.env.VOICE_CHANNEL_ID) ?? null;
      if (isVoiceBasedChannel(cachedChannel)) {
        try {
          await client.voice.joinChannel(cachedChannel, {
            selfMute: true,
            selfDeaf: true,
            selfVideo: false,
          });
          log.info({ channelId: process.env.VOICE_CHANNEL_ID }, 'Joined voice channel');
        } catch (err) {
          log.error({ err }, 'Error joining voice channel');
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

        selfUser.setPresence({ activities: [rp, custom, spotify] });
        log.info('Status rotator initialized');
      } catch (err) {
        log.error({ err }, 'Status rotator error');
      }
    }
  },
};

export default readyEvent;
