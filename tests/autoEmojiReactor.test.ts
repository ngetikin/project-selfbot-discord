import autoEmojiReactor from '../src/events/autoEmojiReactor';

describe('autoEmojiReactor event', () => {
  const client = {};

  beforeEach(() => {
    process.env.EMOJI_CHANNEL_ID = 'channel-1';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.EMOJI_CHANNEL_ID;
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
});
