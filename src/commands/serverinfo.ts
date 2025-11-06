import { getLogger } from '../utils/logger';
import { CommandModule } from '../types/modules';

const log = getLogger('commands:serverinfo');

const serverInfoCommand: CommandModule = {
  name: 'serverinfo',
  description: 'Tampilkan informasi dasar server tempat command dipanggil.',
  run: async (client, message) => {
    const guild = message.guild;
    if (!guild) {
      await message.channel.send('This command only works in a server.');
      return;
    }
    const info = `**Server Info**
- Name: ${guild.name}
- ID: ${guild.id}
- Members: ${guild.memberCount}
- Owner: <@${guild.ownerId}>
    - Created: ${guild.createdAt.toUTCString()}`;
    await message.channel.send(info);
    log.debug({ guildId: guild.id }, 'Server info command executed');
  },
};

export default serverInfoCommand;
