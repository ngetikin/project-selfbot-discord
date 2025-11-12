jest.mock('../src/utils/logger', () => {
  const mockLogger = {
    child: jest.fn().mockReturnThis(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockLogger,
    getLogger: jest.fn(() => mockLogger),
  };
});

import autoEmojiReactor, { resetEmojiThrottle } from '../src/events/autoEmojiReactor';

describe('autoEmojiReactor event', () => {
  const client = {};

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EMOJI_CHANNEL_ID = 'channel-1';
    delete process.env.EMOJI_THROTTLE_MAX;
    delete process.env.EMOJI_THROTTLE_WINDOW_MS;
    resetEmojiThrottle();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    delete process.env.EMOJI_CHANNEL_ID;
    delete process.env.EMOJI_THROTTLE_MAX;
    delete process.env.EMOJI_THROTTLE_WINDOW_MS;
  });

  it('ignores messages outside target channel', async () => {
    const react = jest.fn();
    const message = {
      channel: { id: 'other-channel' },
      webhookId: null,
      author: { bot: false },
      react,
    };

    await autoEmojiReactor.run(client as any, message as any);

    expect(react).not.toHaveBeenCalled();
  });

  it('falls back to global emoji pool', async () => {
    const react = jest.fn().mockResolvedValue(undefined);
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const message = {
      channel: { id: 'channel-1' },
      webhookId: null,
      author: { bot: false },
      guild: {
        emojis: {
          cache: {
            filter: jest.fn(() => ({ size: 0, values: () => [] })),
          },
        },
      },
      react,
    };

    await autoEmojiReactor.run(client as any, message as any);

    expect(react).toHaveBeenCalledTimes(1);
    expect(typeof react.mock.calls[0][0]).toBe('string');
  });

  it('uses custom guild emojis when available', async () => {
    const react = jest.fn().mockResolvedValue(undefined);
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const message = {
      channel: { id: 'channel-1' },
      webhookId: null,
      author: { bot: false },
      guild: {
        emojis: {
          cache: {
            filter: jest.fn(() => ({
              size: 1,
              values: () => [{ id: '987', name: 'smile', animated: false }],
            })),
          },
        },
      },
      react,
    };

    await autoEmojiReactor.run(client as any, message as any);

    expect(react).toHaveBeenCalledWith('smile:987');
  });

  it('throttles reactions when limit reached', async () => {
    process.env.EMOJI_THROTTLE_MAX = '1';
    process.env.EMOJI_THROTTLE_WINDOW_MS = '60000';
    const react = jest.fn().mockResolvedValue(undefined);
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const nowSpy = jest.spyOn(Date, 'now');
    let fakeNow = 0;
    nowSpy.mockImplementation(() => fakeNow);

    const message = {
      channel: { id: 'channel-1' },
      webhookId: null,
      author: { bot: false },
      guild: {
        emojis: {
          cache: {
            filter: jest.fn(() => ({ size: 0, values: () => [] })),
          },
        },
      },
      react,
    };

    await autoEmojiReactor.run(client as any, message as any);
    fakeNow = 1000; // still inside throttle window
    await autoEmojiReactor.run(client as any, message as any);

    expect(react).toHaveBeenCalledTimes(1);
    nowSpy.mockRestore();
  });
});
