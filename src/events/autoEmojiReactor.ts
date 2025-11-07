import type { EmojiIdentifierResolvable, GuildEmoji } from 'discord.js-selfbot-v13';
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

const toReactionIdentifier = (emoji: EmojiIdentifierResolvable): string | null => {
  if (typeof emoji === 'string') {
    return emoji;
  }
  if (typeof (emoji as { identifier?: unknown }).identifier === 'string') {
    return (emoji as { identifier: string }).identifier;
  }
  if (
    emoji &&
    typeof emoji === 'object' &&
    'id' in emoji &&
    'name' in emoji &&
    typeof emoji.id === 'string' &&
    emoji.id &&
    typeof emoji.name === 'string' &&
    emoji.name
  ) {
    return `${emoji.name}:${emoji.id}`;
  }
  return null;
};

const autoEmojiReactor: EventModule = {
  event: 'messageCreate',
  run: async (client, message) => {
    try {
      if (message.channel.id !== process.env.EMOJI_CHANNEL_ID) return;
      if (!message.webhookId && message.author.bot) return;

      // ambil custom non-animated emoji dari server
      const emojiPool: EmojiIdentifierResolvable[] = [];
      if (message.guild) {
        const customEmojis = message.guild.emojis.cache.filter(
          (emoji: GuildEmoji) => !emoji.animated,
        );
        if (customEmojis.size > 0) {
          for (const emoji of customEmojis.values()) {
            emojiPool.push(emoji);
          }
        }
      }

      // fallback kalau ga ada emoji server
      if (emojiPool.length === 0) {
        emojiPool.push(...GLOBAL_EMOJI_POOL);
      }

      // tentukan berapa banyak emoji (acak antara 2–5)
      const maxReact = Math.min(15, emojiPool.length);
      const howMany = Math.floor(Math.random() * maxReact) + 1;

      // pilih random tanpa duplikat
      const shuffled = [...emojiPool].sort(() => Math.random() - 0.5);
      const picks = shuffled.slice(0, howMany);

      for (const e of picks) {
        try {
          const reaction = toReactionIdentifier(e);
          if (!reaction) {
            log.warn('Skipping reaction with unsupported emoji payload.');
            continue;
          }
          await message.react(reaction);
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
