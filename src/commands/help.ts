import { CommandModule } from '../types/modules';

const helpCommand: CommandModule = {
  name: 'help',
  description: 'Tampilkan daftar command yang tersedia.',
  run: async (client, message) => {
    const commandsCollection = client.commands as Map<string, CommandModule> | undefined;
    if (!commandsCollection || commandsCollection.size === 0) {
      await message.channel.send('Belum ada command yang terdaftar.');
      return;
    }

    const commands = Array.from(commandsCollection.values()).filter(
      cmd => cmd && typeof cmd.name === 'string',
    );
    commands.sort((a, b) => a.name.localeCompare(b.name));

    const textPrefix = process.env.TEXT_PREFIX
      ? `Gunakan prefix teks \`${process.env.TEXT_PREFIX}\` atau mention untuk menjalankan command.`
      : 'Gunakan mention ke akun ini untuk menjalankan command.';

    const lines = commands.map(cmd => {
      const description = cmd.description ? ` – ${cmd.description}` : '';
      return `• **${cmd.name}**${description}`;
    });

    const response = ['**Daftar Command**', textPrefix, '', ...lines].join('\n');
    await message.channel.send(response);
  },
};

export default helpCommand;
