require('dotenv').config();
const { Client, Collection, RichPresence, CustomStatus, SpotifyRPC } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');

const client = new Client({ checkUpdate: false });

client.commands = new Collection();

// load commands
const cmdsPath = path.join(__dirname, 'commands');
if (fs.existsSync(cmdsPath)) {
  for (const file of fs.readdirSync(cmdsPath).filter(f=>f.endsWith('.js'))) {
    const cmd = require(`./commands/${file}`);
    if (cmd && cmd.name) client.commands.set(cmd.name, cmd);
  }
}

// load events
const evPath = path.join(__dirname, 'events');
if (fs.existsSync(evPath)) {
  for (const file of fs.readdirSync(evPath).filter(f=>f.endsWith('.js'))) {
    const evt = require(`./events/${file}`);
    if (evt && evt.event && evt.run) client.on(evt.event, (...args) => evt.run(client, ...args));
  }
}

client.once('ready', () => console.log('[READY] Logged in as', client.user.tag));
client.login(process.env.TOKEN);
