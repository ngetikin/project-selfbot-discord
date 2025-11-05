import messageCreateEvent from '../src/events/messageCreate';

const createClient = () => {
  const commands = new Map();
  return {
    user: { id: 'self-id', tag: 'Self#0001' },
    commands,
  };
};

const createMessage = (overrides: Partial<Record<string, any>> = {}) => {
  const defaultMember = {
    roles: {
      cache: {
        has: jest.fn(() => true),
      },
    },
  };

  return {
    author: { id: 'self-id', tag: 'SelfUser#0001' },
    content: '<@self-id> ping',
    channel: {
      id: 'channel-id',
      send: jest.fn().mockResolvedValue(undefined),
    },
    guild: {
      members: {
        cache: {
          get: jest.fn(() => defaultMember),
        },
      },
    },
    ...overrides,
  };
};

describe('messageCreateEvent', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('executes the mapped command when invoked by self with required role', async () => {
    const client = createClient();
    const commandRun = jest.fn();
    client.commands.set('ping', { name: 'ping', run: commandRun });
    const message = createMessage();

    await messageCreateEvent.run(client as any, message as any);

    expect(commandRun).toHaveBeenCalledTimes(1);
    expect(commandRun).toHaveBeenCalledWith(client, message, []);
    expect(message.channel.send).not.toHaveBeenCalledWith(
      'Kamu tidak punya izin untuk menjalankan command ini.',
    );
  });

  it('ignores messages from other users', async () => {
    const client = createClient();
    const commandRun = jest.fn();
    client.commands.set('ping', { name: 'ping', run: commandRun });
    const message = createMessage({
      author: { id: 'someone-else', tag: 'Other#0001' },
      content: '<@self-id> ping',
    });

    await messageCreateEvent.run(client as any, message as any);

    expect(commandRun).not.toHaveBeenCalled();
  });

  it('supports text prefix when configured', async () => {
    process.env.TEXT_PREFIX = '!';
    const client = createClient();
    const commandRun = jest.fn();
    client.commands.set('ping', { name: 'ping', run: commandRun });
    const message = createMessage({
      content: '!ping   extra',
    });

    await messageCreateEvent.run(client as any, message as any);

    expect(commandRun).toHaveBeenCalledTimes(1);
    expect(commandRun).toHaveBeenCalledWith(client, message, ['extra']);
  });

  it('refuses execution when the self account lacks the admin role', async () => {
    const client = createClient();
    const commandRun = jest.fn();
    client.commands.set('ping', { name: 'ping', run: commandRun });
    const missingRoleMember = {
      roles: {
        cache: {
          has: jest.fn(() => false),
        },
      },
    };
    const message = createMessage({
      guild: {
        members: {
          cache: {
            get: jest.fn(() => missingRoleMember),
          },
        },
      },
    });

    await messageCreateEvent.run(client as any, message as any);

    expect(commandRun).not.toHaveBeenCalled();
    expect(message.channel.send).toHaveBeenCalledWith(
      'Kamu tidak punya izin untuk menjalankan command ini.',
    );
  });
});
