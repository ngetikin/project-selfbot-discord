import { EventEmitter } from 'events';
import https from 'https';
import dailyMemeEvent, { resetDailyMemeScheduler } from '../src/events/dailyMeme';

describe('dailyMeme event', () => {
  let getSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    resetDailyMemeScheduler();
    getSpy = jest.spyOn(https, 'get');
  });

  afterEach(() => {
    getSpy.mockRestore();
    resetDailyMemeScheduler();
    jest.useRealTimers();
    delete process.env.DAILY_MEME_CHANNEL_ID;
  });

  it('skips initialization when channel id missing', async () => {
    process.env.DAILY_MEME_CHANNEL_ID = '';
    const client = {
      channels: {
        cache: new Map(),
        fetch: jest.fn(),
      },
    };

    await dailyMemeEvent.run(client as any);

    expect(getSpy).not.toHaveBeenCalled();
  });

  it('sends meme when scheduler fires', async () => {
    process.env.DAILY_MEME_CHANNEL_ID = 'channel-123';
    const send = jest.fn().mockResolvedValue(undefined);
    const client = {
      channels: {
        cache: new Map([['channel-123', { send }]]),
        fetch: jest.fn(),
      },
    };

    getSpy.mockImplementation((url: any, options?: any, callback?: any) => {
      const cb = typeof options === 'function' ? options : callback;
      const response = new EventEmitter() as any;
      response.statusCode = 200;
      response.setEncoding = jest.fn();
      process.nextTick(() => {
        cb?.(response);
        response.emit('data', JSON.stringify({ data: { url: 'https://example.com/meme.jpg' } }));
        response.emit('end');
      });
      return { on: jest.fn().mockReturnThis() } as any;
    });

    const nowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValue(new Date('2025-01-01T00:00:00Z').getTime());

    await dailyMemeEvent.run(client as any);

    await jest.runOnlyPendingTimersAsync();

    expect(send).toHaveBeenCalledWith({
      embeds: [
        expect.objectContaining({
          title: 'Candaan Pagi',
          image: { url: 'https://example.com/meme.jpg' },
        }),
      ],
    });

    nowSpy.mockRestore();
  });
});
