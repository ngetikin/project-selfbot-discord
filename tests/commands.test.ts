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

import clearCommand from '../src/commands/clearMessage';
import serverInfoCommand from '../src/commands/serverinfo';
import webhookCommand from '../src/commands/webhook';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('clear command', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('deletes self messages and reports success', async () => {
    jest.useFakeTimers();

    const messages = [
      { author: { id: 'self-id' }, delete: jest.fn().mockResolvedValue(undefined) },
      { author: { id: 'self-id' }, delete: jest.fn().mockResolvedValue(undefined) },
      { author: { id: 'other' }, delete: jest.fn() },
    ];

    const fetch = jest.fn().mockResolvedValue({
      filter: jest.fn(predicate => {
        const filtered = messages.filter(predicate);
        return {
          first: (count: number) => filtered.slice(0, count),
        };
      }),
    });

    const send = jest.fn().mockResolvedValue({ delete: jest.fn() });
    const message = {
      author: { id: 'self-id' },
      channel: {
        messages: { fetch },
        send,
      },
    };

    const client = { user: { id: 'self-id' } };

    await clearCommand.run(client as any, message as any, ['2']);

    expect(fetch).toHaveBeenCalledWith({ limit: expect.any(Number) });
    expect(messages[0].delete).toHaveBeenCalled();
    expect(messages[1].delete).toHaveBeenCalled();
    expect(send).toHaveBeenCalledWith('Removed 2 messages.');

    jest.runOnlyPendingTimers();
  });

  it('rejects invalid count', async () => {
    const send = jest.fn();
    const fetch = jest.fn();
    const message = {
      author: { id: 'self-id' },
      channel: {
        messages: { fetch },
        send,
      },
    };

    const client = { user: { id: 'self-id' } };

    await clearCommand.run(client as any, message as any, ['200']);

    expect(fetch).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledWith('Count must be between 1 and 100');
  });
});

describe('serverinfo command', () => {
  it('sends guild information when executed in a server', async () => {
    const send = jest.fn();
    const createdAt = new Date('2024-01-01T00:00:00Z');
    const message = {
      guild: {
        name: 'Test Guild',
        id: 'guild-123',
        memberCount: 42,
        ownerId: 'owner-1',
        createdAt,
      },
      channel: { send },
    };

    await serverInfoCommand.run({} as any, message as any, []);

    expect(send).toHaveBeenCalledTimes(1);
    const payload = send.mock.calls[0][0];
    expect(payload).toContain('**Server Info**');
    expect(payload).toContain('Test Guild');
    expect(payload).toContain('guild-123');
    expect(payload).toContain('<@owner-1>');
  });

  it('warns when command used outside guild', async () => {
    const send = jest.fn();
    const message = {
      guild: null,
      channel: { send },
    };

    await serverInfoCommand.run({} as any, message as any, []);

    expect(send).toHaveBeenCalledWith('This command only works in a server.');
  });
});

describe('webhook command', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as any;
    process.env.WEBHOOK_URL = 'https://example.com/webhook';
  });

  afterEach(() => {
    if (originalFetch) {
      global.fetch = originalFetch;
    } else if ('fetch' in global) {
      delete (global as { fetch?: unknown }).fetch;
    }
    delete process.env.WEBHOOK_URL;
  });

  it('requires message content', async () => {
    const send = jest.fn();
    const message = {
      channel: { send },
    };

    await webhookCommand.run({} as any, message as any, []);

    expect(send).toHaveBeenCalledWith('Usage: <@me> webhook <message>');
    expect(global.fetch as jest.Mock).not.toHaveBeenCalled();
  });

  it('invokes fetch and reports success', async () => {
    const send = jest.fn();
    const message = {
      channel: { send },
    };

    await webhookCommand.run({} as any, message as any, ['hello', 'world']);

    expect(global.fetch as jest.Mock).toHaveBeenCalledWith(
      'https://example.com/webhook',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'hello world' }),
      }),
    );
    expect(send).toHaveBeenCalledWith('Webhook sent ✅');
  });

  it('handles non-ok responses gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });
    const send = jest.fn();
    const message = { channel: { send } };

    await webhookCommand.run({} as any, message as any, ['hello']);

    expect(send).toHaveBeenCalledWith('Failed to send webhook.');
  });

  it('handles fetch rejection', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('network failure'));
    const send = jest.fn();
    const message = { channel: { send } };

    await webhookCommand.run({} as any, message as any, ['ping']);

    expect(send).toHaveBeenCalledWith('Failed to send webhook.');
  });
});
