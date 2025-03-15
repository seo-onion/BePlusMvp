const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits, Events } = require("discord.js");
const createErrorEmbed = require("./utils/errorEmbed");
require("dotenv").config();

// Load environment variables for channel and role IDs.
const GENERAL_CHANNEL = process.env.COMMAND_CHANNEL;
const COMMAND_CHANNEL = process.env.ADMIN_COMMAND_CHANNEL;
const TESTER = process.env.TESTER_ROLE;
const VERIFIED = process.env.VERIFICATED_ROLE;
const NO_VERIFIED = process.env.NOT_VERIFICATED_ROLE;

// Define permissions for each channel specifying allowed commands.
const channelCommandPermissions = {
  [GENERAL_CHANNEL]: ['empezar', 'vincularmeconfit', 'reclamar', 'pasos', 'comprar', 'tienda', 'yo', 'desbloquear', 'rockie', 'equipar'],
  [COMMAND_CHANNEL]: ['item', 'eliminar', 'creardivisas', 'crearlogros']
};

// Initialize Discord client with necessary intents.
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

// Dynamically load command files from subdirectories.
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
      console.warn(`⚠️ Advertencia: El archivo ${file} no tiene "data" o "execute".`);
    }
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  const allowedCommands = channelCommandPermissions[interaction.channelId];

  // Validate if the command is allowed in the current channel.
  if (allowedCommands && !allowedCommands.includes(interaction.commandName)) {
    const errorEmbed = createErrorEmbed(
        "🚫 **Comando No Permitido**",
        "Este comando no está permitido en este canal."
    );
    return interaction.reply({ embeds: [errorEmbed], flags: 64 });
  }

  if (!command) {
    console.error(`❌ No se encontró un comando para ${interaction.commandName}`);
    return;
  }

  try {
    const member = interaction.member;

    // Check if user has completed registration.
    if (command.restricted && member.roles.cache.has(NO_VERIFIED)) {
      const errorEmbed = createErrorEmbed(
          "🚫 **Registro Incompleto**",
          "Debes completar el registro antes de usar este comando. Usa `/empezar` para obtener acceso."
      );
      return interaction.reply({ embeds: [errorEmbed], flags: 64 });
    }

    // Check if user is verified by an admin.
    if (command.restricted && !member.roles.cache.has(VERIFIED)) {
      const errorEmbed = createErrorEmbed(
          "🚫 **Esperando Verificación**",
          "Debes esperar a que un administrador complete tu registro."
      );
      return interaction.reply({ embeds: [errorEmbed], flags: 64 });
    }

    // Defer interaction to avoid timeout errors.
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply({ flags: 64 });
    }

    await command.execute(interaction);

  } catch (error) {
    console.error("❌ Error al ejecutar el comando:", error);

    const errorEmbed = createErrorEmbed(
        "❌ **Error al ejecutar el comando**",
        "Tuvimos un problema inesperado. Intenta nuevamente más tarde."
    );

    // Respond with an error message if execution fails.
    if (interaction.replied || interaction.deferred) {
      return interaction.editReply({ embeds: [errorEmbed] });
    } else {
      return interaction.reply({ embeds: [errorEmbed], flags: 64 });
    }
  }
});

client.on(Events.MessageCreate, async (message) => {
  const targetChannelId = GENERAL_CHANNEL;

  // Ignore bot messages and commands.
  if (message.author.bot || message.content.startsWith('/')) return;

  // Automatically delete non-command messages in the general channel.
  if (message.channel.id === targetChannelId) {
    try {
      await message.delete();
      console.log(`🗑️ Mensaje de ${message.author.tag} eliminado en el canal.`);
    } catch (error) {
      console.error(`❌ Error al eliminar el mensaje:`, error);
    }
  }
});

// Start the bot if this is the main module.
if (require.main === module) {
  client.login(process.env.TOKEN);
}

module.exports = client;
