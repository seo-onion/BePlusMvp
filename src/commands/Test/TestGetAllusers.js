const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { getAllUser } = require("../../services/user/userService");
const createAlertEmbed = require("../../utils/alertEmbed");

const DEV = process.env.DEV_ROLE;
const ADMIN = process.env.ADMIN_ROLE;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("getusers")
    .setDescription("Obtiene todos los usuarios del sistema.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const member = interaction.member;

    // ✅ Validación de roles
    if (!member.roles.cache.has(DEV) && !member.roles.cache.has(ADMIN)) {
      const embed = createAlertEmbed("🚫 No tienes permisos para ejecutar este comando.");
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    try {
      await getAllUser();
      console.log(new Date().toISOString().split("T")[0]);
      return await interaction.reply({
        content: `✅ Usuarios obtenidos correctamente.`,
        ephemeral: true
      });
    } catch (error) {
      console.error("❌ Error al obtener usuarios:", error);
      return await interaction.reply({
        content: "❌ Ocurrió un error al intentar obtener los usuarios.",
        ephemeral: true
      });
    }
  },
};
