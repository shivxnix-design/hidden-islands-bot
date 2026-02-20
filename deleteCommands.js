require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    console.log(`${client.user.tag} is online!`);

    // Fetch all global commands
    const commands = await client.application.commands.fetch();
    console.log("Global commands found:", commands.map(c => c.name));

    for (const cmd of commands.values()) {
        if (cmd.name === 'mutation') {
            await cmd.delete();
            console.log(`Deleted global command: ${cmd.name}`);
        }
    }

    console.log("Done deleting commands.");
    process.exit(0); // Stop script
});

// Log in with token from .env
client.login(process.env.TOKEN);