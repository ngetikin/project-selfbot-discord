const GLOBAL_EMOJI_POOL = ['😀','😅','😂','🤣','😊','😉','😍','🤩','😎','🙃','🤔','👍','👏','🔥','✨'];

module.exports = {
  event: 'messageCreate',
  run: async (client, message) => {
    try {
      if (message.channel.id !== process.env.EMOJI_CHANNEL_ID) return;
      if (!message.webhookId && message.author.bot) return;

      // ambil custom non-animated emoji dari server
      let emojiPool = [];
      if (message.guild) {
        const customEmojis = message.guild.emojis.cache.filter(e => !e.animated);
        if (customEmojis.size > 0) {
          emojiPool = emojiPool.concat(customEmojis.map(e => e));
        }
      }

      // fallback kalau ga ada emoji server
      if (emojiPool.length === 0) {
        emojiPool = GLOBAL_EMOJI_POOL;
      }

      // tentukan berapa banyak emoji (acak antara 2–5)
      const maxReact = Math.min(15, emojiPool.length);
      const howMany = Math.floor(Math.random() * maxReact) + 1;

      // pilih random tanpa duplikat
      const shuffled = [...emojiPool].sort(() => Math.random() - 0.5);
      const picks = shuffled.slice(0, howMany);

      for (const e of picks) {
        try {
          await message.react(e.id ? `${e.name}:${e.id}` : e);
        } catch (err) {
          console.error('[autoEmojiReactor] gagal react:', err.message || err);
        }
      }
    } catch (err) {
      console.error('[autoEmojiReactor] error', err);
    }
  }
};
