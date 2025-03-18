const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits, Events } = require("discord.js");
const createErrorEmbed = require("./utils/errorEmbed");
require("dotenv").config();

// 📌 Variables de entorno
const GENERAL_CHANNEL = process.env.COMMAND_CHANNEL;
const COMMAND_CHANNEL = process.env.ADMIN_COMMAND_CHANNEL;
const TESTER = process.env.TESTER_ROLE;
const VERIFIED = process.env.VERIFICATED_ROLE;
const NO_VERIFIED = process.env.NOT_VERIFICATED_ROLE;

const channelCommandPermissions = {
  [GENERAL_CHANNEL]: ['empezar', 'vincularmeconfit', 'reclamar', 'pasos', 'comprar', 'tienda', 'yo', 'desbloquear', 'rockie', 'equipar'],
  [COMMAND_CHANNEL]: ['item', 'eliminar', 'creardivisas', 'crearlogros']
};

// 📌 Inicializar cliente
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

// 📌 Cargar comandos
const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  if (!fs.lstatSync(folderPath).isDirectory()) continue;

  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(path.join(folderPath, file));
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
    } else {
      console.warn(`⚠️ Advertencia: El archivo ${file} no tiene "data" o "execute".`);
    }
  }
}

// 📌 Ejecutar comandos
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  const allowedCommands = channelCommandPermissions[interaction.channelId];

  // ✅ Validar si el comando está permitido en el canal
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

    // ✅ Validar roles
    if (command.restricted && member.roles.cache.has(NO_VERIFIED)) {
      const errorEmbed = createErrorEmbed(
        "🚫 **Registro Incompleto**",
        "Debes completar el registro antes de usar este comando. Usa `/empezar`."
      );
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    if (command.restricted && !member.roles.cache.has(VERIFIED)) {
      const errorEmbed = createErrorEmbed(
        "🚫 **Esperando Verificación**",
        "Debes esperar a que un administrador complete tu registro."
      );
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    await command.execute(interaction);

  } catch (error) {
    console.error("❌ Error al ejecutar el comando:", error);

    const errorEmbed = createErrorEmbed(
      "❌ **Error al ejecutar el comando**",
      "Tuvimos un problema inesperado. Intenta nuevamente más tarde."
    );

    // ✅ Mejor manejo de errores: editReply, followUp, reply
    if (interaction.deferred) {
      return interaction.editReply({ embeds: [errorEmbed] });
    } else if (interaction.replied) {
      return interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    } else {
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
});

// 📌 Borrar mensajes fuera de comandos
client.on(Events.MessageCreate, async (message) => {
  const targetChannelId = GENERAL_CHANNEL;

  if (message.author.bot || message.content.startsWith('/')) return;

  if (message.channel.id === targetChannelId) {
    try {
      await message.delete();
      console.log(`🗑️ Mensaje de ${message.author.tag} eliminado en el canal.`);
    } catch (error) {
      console.error(`❌ Error al eliminar el mensaje:`, error);
    }
  }
});

// 📌 Iniciar el bot si se ejecuta directamente
if (require.main === module) {
  client.login(process.env.TOKEN);
}

module.exports = client;
