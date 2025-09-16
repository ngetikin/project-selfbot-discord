const { RichPresence, CustomStatus, SpotifyRPC } = require('discord.js-selfbot-v13');

module.exports = {
  event: 'ready',
  run: async (client) => {
    console.log('[EVENT] READY');
    console.log(`[READY] Logged in as ${client.user.tag}`);

    // Auto join voice — gunakan helper voice API
    if (process.env.VOICE_CHANNEL_ID) {
      const ch = client.channels.cache.get(process.env.VOICE_CHANNEL_ID);
      if (ch) {
        try {
          // Gunakan API client.voice.joinChannel() sesuai sample JoinVoice.js
          const connection = await client.voice.joinChannel(ch, {
            selfMute: true,
            selfDeaf: true,
            selfVideo: false,
          });
          console.log('[READY] Joined VC successfully.');
          // leave after 5s as example (opsional)
          // setTimeout(() => connection.disconnect(), 5_000);
        } catch (e) {
          console.error('[READY] Error joining VC:', e && e.message ? e.message : e);
        }
      } else console.warn('[READY] Voice channel not found in cache.');
    }

    // Auto status rotator (basic example)
    if (process.env.AUTO_STATUS_ROTATOR === 'true' || process.env.AUTO_STATUS_ROTATOR === '1') {
      (async () => {
        try {
          // Example 1: RichPresence from your provided example (minimal)
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
      })();
    }
  }
};
