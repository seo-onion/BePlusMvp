const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits, Events } = require("discord.js");
const createErrorEmbed = require("./utils/errorEmbed");
require("dotenv").config();

const GENERAL_CHANNEL = process.env.COMMAND_CHANNEL;
const TESTER = process.env.TESTER_ROLE;
const VERIFIED = process.env.VERIFICATED_ROLE;
const NO_VERIFIED = process.env.NOT_VERIFICATED_ROLE;

// Comandos permitidos por canal
const channelCommandPermissions = {
  [GENERAL_CHANNEL]: ['empezar', 'vincularmeconfit', 'reclamar', 'pasos', 'comprar', 'tienda', 'yo', 'desbloquear']
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
      console.warn(`⚠️ Advertencia: El archivo ${file} no tiene "data" o "execute".`);
    }
  }
}
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  const allowedCommands = channelCommandPermissions[interaction.channelId];

  // ✅ Verificar si el comando está permitido en el canal actual
  if (allowedCommands && !allowedCommands.includes(interaction.commandName)) {
    const errorEmbed = createErrorEmbed(
      "🚫 **Comando No Permitido**",
      "Este comando no está permitido en este canal."
    );
    return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }

  if (!command) {
    console.error(`❌ No se encontró un comando para ${interaction.commandName}`);
    return;
  }

  try {
    const member = interaction.member;

    // ✅ Primero verificamos el rol NO_VERIFIED
    if (command.restricted && member.roles.cache.has(NO_VERIFIED)) {
      const errorEmbed = createErrorEmbed(
        "🚫 **Registro Incompleto**",
        "Debes completar el registro antes de usar este comando. Usa `/empezar` para obtener acceso."
      );
      return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    // ✅ Luego validamos el rol VERIFIED (esperando confirmación de admin)
    if (command.restricted && !member.roles.cache.has(VERIFIED)) {
      const errorEmbed = createErrorEmbed(
        "🚫 **Esperando Verificación**",
        "Debes esperar a que un administrador complete tu registro."
      );
      return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    // ✅ deferReply solo si no ha sido deferida antes
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply({ ephemeral: true });
    }

    await command.execute(interaction);

  } catch (error) {
    console.error("❌ Error al ejecutar el comando:", error);

    const errorEmbed = createErrorEmbed(
      "❌ **Error al ejecutar el comando**",
      "Tuvimos un problema inesperado. Intenta nuevamente más tarde."
    );

    if (interaction.replied || interaction.deferred) {
      return interaction.editReply({ embeds: [errorEmbed] });
    } else {
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
});

// 🚨 Eliminar mensajes normales en el canal específico
client.on(Events.MessageCreate, async (message) => {
  const targetChannelId = GENERAL_CHANNEL;

  // Ignorar mensajes del bot o comandos slash
  if (message.author.bot || message.content.startsWith('/')) return;

  // Eliminar mensajes en el canal específico
  if (message.channel.id === targetChannelId) {
    try {
      await message.delete();
      console.log(`🗑️ Mensaje de ${message.author.tag} eliminado en el canal.`);
    } catch (error) {
      console.error(`❌ Error al eliminar el mensaje:`, error);
    }
  }
});

if (require.main === module) {
  client.login(process.env.TOKEN);
}

module.exports = client;
