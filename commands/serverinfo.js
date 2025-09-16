module.exports = {
  name: 'serverinfo',
  run: async (client, message) => {
    const guild = message.guild;
    if (!guild) return message.channel.send('This command only works in a server.');
    const info = `**Server Info**
- Name: ${guild.name}
- ID: ${guild.id}
- Members: ${guild.memberCount}
- Owner: <@${guild.ownerId}>
- Created: ${guild.createdAt.toUTCString()}`;
    message.channel.send(info);
  }
};
