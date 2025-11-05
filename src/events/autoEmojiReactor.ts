import { getLogger } from '../utils/logger';
import { EventModule } from '../types/modules';

const GLOBAL_EMOJI_POOL = [
  '😀',
  '😅',
  '😂',
  '🤣',
  '😊',
  '😉',
  '😍',
  '🤩',
  '😎',
  '🙃',
  '🤔',
  '👍',
  '👏',
  '🔥',
  '✨',
];

const log = getLogger('events:autoEmojiReactor');

const autoEmojiReactor: EventModule = {
  event: 'messageCreate',
  run: async (client, message) => {
    try {
      if (message.channel.id !== process.env.EMOJI_CHANNEL_ID) return;
      if (!message.webhookId && message.author.bot) return;

      // ambil custom non-animated emoji dari server
      let emojiPool: any[] = [];
      if (message.guild) {
        const customEmojis = message.guild.emojis.cache.filter(e => !e.animated);
        if (customEmojis.size > 0) {
          emojiPool = emojiPool.concat(Array.from(customEmojis.values()));
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
          log.error({ err }, 'Failed to add reaction');
        }
      }
    } catch (err) {
      log.error({ err }, 'Unexpected error in autoEmojiReactor');
    }
  },
};

export default autoEmojiReactor;
