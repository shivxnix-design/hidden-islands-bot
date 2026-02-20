require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const GUILD_ID = '1462820607761715409'; // replace with your server ID

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    console.log(`${client.user.tag} is online!`);

    // Delete global commands
    const globalCommands = await client.application.commands.fetch();
    for (const cmd of globalCommands.values()) {
        if (cmd.name === 'mutation') {
            await cmd.delete();
            console.log(`Deleted global command: ${cmd.name}`);
        }
    }

    // Delete guild commands (optional)
    if (GUILD_ID) {
        const guild = client.guilds.cache.get(GUILD_ID);
        if (guild) {
            const guildCommands = await guild.commands.fetch();
            for (const cmd of guildCommands.values()) {
                if (cmd.name === 'mutation') {
                    await cmd.delete();
                    console.log(`Deleted guild command: ${cmd.name}`);
                }
            }
        }
    }

    console.log("All mutation commands deleted.");
    process.exit(0);
});

// Use environment variable instead of hardcoded token
client.login(process.env.TOKEN);