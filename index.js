require('dotenv').config();

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const speciesList = require('./data/species.json');

const GUILD_ID = '1462820607761715409'; // replace with your new server ID

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const cooldowns = new Map();

client.once('ready', async () => {
    console.log(`${client.user.tag} is online!`);

    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {
        console.error("Guild not found. Check your GUILD_ID.");
        return;
    }

    // Delete any existing /rollmutation commands in this guild
    const commands = await guild.commands.fetch();
    for (const cmd of commands.values()) {
        if (cmd.name === 'rollmutation') {
            await cmd.delete();
        }
    }

    // Register new /rollmutation command
    await guild.commands.create({
        name: 'rollmutation',
        description: 'Roll a mutation for your dinosaur',
        options: [
            {
                name: 'species',
                description: 'Select your dinosaur species',
                type: 3,
                required: true,
                autocomplete: true
            },
            {
                name: 'name',
                description: 'Your dinosaur’s personal name',
                type: 3,
                required: true
            }
        ]
    });

    console.log('/rollmutation guild command registered successfully!');
});

client.on('interactionCreate', async interaction => {

    // AUTOCOMPLETE
    if (interaction.isAutocomplete()) {
        if (interaction.commandName === 'rollmutation') {
            const focused = interaction.options.getFocused();
            const filtered = speciesList
                .filter(s => s.toLowerCase().includes(focused.toLowerCase()))
                .slice(0, 25);

            await interaction.respond(
                filtered.map(s => ({ name: s, value: s }))
            );
        }
        return;
    }

    // COMMAND EXECUTION
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'rollmutation') {

        const species = interaction.options.getString('species');
        const dinoName = interaction.options.getString('name');

        const key = `${interaction.user.id}-${species}`;
        const now = Date.now();
        const cooldownTime = 30 * 60 * 1000; // 30 minutes

        // Cooldown check
        if (cooldowns.has(key)) {
            const expiration = cooldowns.get(key) + cooldownTime;
            if (now < expiration) {
                const remaining = Math.ceil((expiration - now) / 60000);
                return interaction.reply({
                    content: `You must wait ${remaining} more minute(s) before rolling ${species} again.`,
                    ephemeral: true
                });
            }
        }

        cooldowns.set(key, now);

        // 5% mutation chance
        const roll = Math.random();

        if (roll <= 0.05) {
            // Mutation success embed
            const mutations = [
                { name: "Albino", image: "https://cdn.discordapp.com/attachments/1462828823551934527/1474165187886977074/Albino.jpg" },
                { name: "Melanistic", image: "https://cdn.discordapp.com/attachments/1462828823551934527/1474165188470243483/Melan.jpg" },
                { name: "Piebald", image: "https://cdn.discordapp.com/attachments/1462828823551934527/1474165188998463641/Piebald.jpg" }
            ];

            const mutation = mutations[Math.floor(Math.random() * mutations.length)];

            const embed = new EmbedBuilder()
                .setTitle(`🧬 ${dinoName} rolled a mutation!`)
                .setDescription(`Species: **${species}**\nMutation: **${mutation.name}**`)
                .setImage(mutation.image)
                .setColor(0x00ff00);

            return interaction.reply({ embeds: [embed] });

        } else {
            // No mutation embed with emoji and thumbnail
            const embed = new EmbedBuilder()
                .setTitle(`🧬 ${dinoName} rolled no mutation`)
                .setDescription(`Species: **${species}**\nBetter luck next time!`)
                .setThumbnail('https://cdn.discordapp.com/attachments/1462828823551934527/1474165187886977074/Albino.jpg') // matches style
                .setColor(0xff0000);

            return interaction.reply({ embeds: [embed] });
        }
    }
});

client.login(process.env.TOKEN);