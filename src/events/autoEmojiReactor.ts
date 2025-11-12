import type { EmojiIdentifierResolvable, GuildEmoji, Message } from 'discord.js-selfbot-v13';
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

const sampleEmojis = (pool: EmojiIdentifierResolvable[], take: number) => {
  const copied = [...pool];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied.slice(0, take);
};

type ThrottleState = { windowStart: number; count: number };
const throttleMap = new Map<string, ThrottleState>();

const parsePositiveNumber = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const getThrottleWindow = () => parsePositiveNumber(process.env.EMOJI_THROTTLE_WINDOW_MS, 60_000);
const getThrottleLimit = () => Math.max(1, parsePositiveNumber(process.env.EMOJI_THROTTLE_MAX, 5));

const getThrottleState = (channelId: string): ThrottleState => {
  const now = Date.now();
  const current = throttleMap.get(channelId);
  if (!current || now - current.windowStart >= getThrottleWindow()) {
    const fresh = { windowStart: now, count: 0 };
    throttleMap.set(channelId, fresh);
    return fresh;
  }
  return current;
};

const reserveSlots = (channelId: string, requested: number) => {
  const state = getThrottleState(channelId);
  const limit = getThrottleLimit();
  const remaining = Math.max(0, limit - state.count);
  if (remaining <= 0) {
    return 0;
  }
  const granted = Math.min(remaining, requested);
  state.count += granted;
  throttleMap.set(channelId, state);
  return granted;
};

const autoEmojiReactor: EventModule<'messageCreate'> = {
  event: 'messageCreate',
  run: async (client, message: Message) => {
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

      const maxReact = Math.min(getThrottleLimit(), emojiPool.length);
      const requested = Math.max(1, Math.floor(Math.random() * maxReact) + 1);
      const allowed = reserveSlots(message.channel.id, requested);

      if (allowed === 0) {
        log.debug({ channelId: message.channel.id }, 'Throttle limit reached, skipping reactions');
        return;
      }

      if (allowed < requested) {
        log.debug(
          { channelId: message.channel.id, allowed, requested },
          'Throttle limited reaction count',
        );
      }

      const picks = sampleEmojis(emojiPool, allowed);

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

export const resetEmojiThrottle = () => throttleMap.clear();
