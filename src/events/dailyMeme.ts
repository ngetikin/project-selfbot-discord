import https from 'https';
import { EventModule } from '../types/modules';

interface CandaanApiResponse {
  data?: {
    url?: string;
    source?: string;
  };
}

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const DEFAULT_API_URL = 'https://candaan-api.vercel.app/api/image/random';
const MEME_API_URL = process.env.DAILY_MEME_API_URL ?? DEFAULT_API_URL;

let jobInitialized = false;
let nextTimeout: NodeJS.Timeout | null = null;

const fetchMeme = async (): Promise<{ url: string; source?: string }> =>
  new Promise((resolve, reject) => {
    https
      .get(MEME_API_URL, res => {
        if (!res) {
          reject(new Error('No response from meme API.'));
          return;
        }

        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Meme API responded with status ${res.statusCode}.`));
          res.resume();
          return;
        }

        let body = '';
        res.setEncoding('utf8');
        res.on('data', chunk => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body) as CandaanApiResponse;
            const url = parsed?.data?.url;
            if (!url) {
              reject(new Error('Meme API response missing image URL.'));
              return;
            }
            resolve({ url, source: parsed?.data?.source });
          } catch (err) {
            reject(err instanceof Error ? err : new Error('Failed to parse meme API response.'));
          }
        });
      })
      .on('error', err => reject(err));
  });

const scheduleNextRun = (callback: () => Promise<void>) => {
  const now = Date.now();
  const nowWib = new Date(now + WIB_OFFSET_MS);
  const nextWib = new Date(nowWib);
  nextWib.setUTCHours(6, 0, 0, 0);
  if (nextWib.getTime() <= nowWib.getTime()) {
    nextWib.setUTCDate(nextWib.getUTCDate() + 1);
  }

  const delay = nextWib.getTime() - nowWib.getTime();
  const nextRunUtc = new Date(now + delay);
  const formatter = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  });
  console.log(`[DAILY_MEME] Next send scheduled at ${formatter.format(nextRunUtc)} (WIB).`);

  nextTimeout = setTimeout(() => {
    nextTimeout = null;
    Promise.resolve(callback())
      .catch(err => {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[DAILY_MEME] Failed to send meme:', message);
      })
      .finally(() => {
        scheduleNextRun(callback);
      });
  }, delay);
};

const dailyMemeEvent: EventModule = {
  event: 'ready',
  run: async client => {
    if (jobInitialized) {
      return;
    }

    const channelId = process.env.DAILY_MEME_CHANNEL_ID;
    if (!channelId) {
      console.warn('[DAILY_MEME] Skipping setup: DAILY_MEME_CHANNEL_ID not configured.');
      jobInitialized = true;
      return;
    }

    const sendDailyMeme = async () => {
      const meme = await fetchMeme();
      const channel =
        client.channels.cache.get(channelId) ??
        (typeof client.channels.fetch === 'function'
          ? await client.channels.fetch(channelId).catch(() => null)
          : null);

      if (!channel || typeof (channel as any).send !== 'function') {
        console.warn('[DAILY_MEME] Target channel not found or not text-based.');
        return;
      }

      const embed: Record<string, unknown> = {
        title: 'Candaan Pagi',
        image: { url: meme.url },
        color: 0xf09b22,
      };

      if (meme.source) {
        embed.url = meme.source;
        embed.footer = { text: meme.source };
      }

      await (channel as any).send({ embeds: [embed] });
      console.log('[DAILY_MEME] Meme sent successfully.');
    };

    jobInitialized = true;
    console.log('[DAILY_MEME] Daily meme scheduler initialized.');
    if (nextTimeout) {
      clearTimeout(nextTimeout);
      nextTimeout = null;
    }
    scheduleNextRun(sendDailyMeme);
  },
};

export default dailyMemeEvent;

export const resetDailyMemeScheduler = () => {
  if (nextTimeout) {
    clearTimeout(nextTimeout);
    nextTimeout = null;
  }
  jobInitialized = false;
};
