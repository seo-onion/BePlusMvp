const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits, Events } = require("discord.js");
const createErrorEmbed = require("./utils/embed/errorEmbed");

const GENERAL_CHANNEL = process.env.DISCORD_COMMAND_CHANNEL;
const COMMAND_CHANNEL = process.env.DISCORD_ADMIN_COMMAND_CHANNEL;
const TESTER = process.env.DISCORD_TESTER_ROLE;
const VERIFIED = process.env.DISCORD_VERIFICATED_ROLE;
const NO_VERIFIED = process.env.DISCORD_NOT_VERIFICATED_ROLE;

const channelCommandPermissions = {
  [GENERAL_CHANNEL]: ['empezar', 'vincularmeconfit', 'reclamar', 'pasos', 'comprar', 'tienda', 'yo', 'desbloquear', 'rockie', 'equipar'],
  [COMMAND_CHANNEL]: ['item', 'eliminar', 'creardivisas', 'crearlogros']
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  if (!fs.lstatSync(folderPath).isDirectory()) continue;

  const commandFiles = fs.readdirSync(folderPath).filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(path.join(folderPath, file));
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
    } else {
      console.warn(`Warning: The file ${file} does not have "data" or "execute"`);
    }
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  const allowedCommands = channelCommandPermissions[interaction.channelId];

  // Check if command is allow in the channel
  if (allowedCommands && !allowedCommands.includes(interaction.commandName)) {
    const errorEmbed = createErrorEmbed(
      "Comando No Permitido",
      "Este comando no está permitido en este canal."
    );
    return interaction.reply({ embeds: [errorEmbed], flags: 64 });
  }
  // Check if command is real
  if (!command) {
    console.error(`❌ No se encontró un comando para ${interaction.commandName}`);
    return;
  }

  try {
    const member = interaction.member;

    if (command.restricted && member.roles.cache.has(NO_VERIFIED)) {
      const errorEmbed = createErrorEmbed(
        "Registro Incompleto",
        "Debes completar el registro antes de usar este comando. Usa `/empezar` para obtener acceso."
      );
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    await command.execute(interaction);

  } catch (error) {
    console.error("❌ Error al ejecutar el comando:", error);

    const errorEmbced = createErrorEmbed();

    if (interaction.replied || interaction.deferred) {
      return interaction.editReply({ embeds: [errorEmbed], flags: 64 });
    } else {
      return interaction.reply({ embeds: [errorEmbed], flags: 64 });
    }
  }
});


// Listener to delete no commands messagge in commands channels 
client.on(Events.MessageCreate, async (message) => {
  const targetChannelId = GENERAL_CHANNEL;

  if (message.author.bot || message.content.startsWith('/')) return;

  if (message.channel.id === targetChannelId) {
    try {
      await message.delete();
    } catch (error) {
      console.error(`Error deleting message:`, error);
    }
  }
});

if (require.main === module) {
  client.login(process.env.TOKEN);
}

module.exports = client;
