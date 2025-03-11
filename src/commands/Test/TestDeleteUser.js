const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { deleteUser } = require("../../services/user/userService");
const createAlertEmbed = require("../../utils/alertEmbed");

const DEV = process.env.DEV_ROLE;
const ADMIN = process.env.ADMIN_ROLE;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("eliminarme")
    .setDescription("Elimina tu usuario del sistema.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const member = interaction.member;

    // ✅ Validación de roles
    if (!member.roles.cache.has(DEV) && !member.roles.cache.has(ADMIN)) {
      const embed = createAlertEmbed("🚫 No tienes permisos para ejecutar este comando.");
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const userId = interaction.user.id;

    try {
      await deleteUser(userId);
      return await interaction.reply({
        content: `✅ Tu usuario ha sido eliminado correctamente.`,
        ephemeral: true
      });
    } catch (error) {
      console.error("❌ Error al eliminar usuario:", error);
      return await interaction.reply({
        content: "❌ Ocurrió un error al intentar eliminar tu usuario.",
        ephemeral: true
      });
    }
  },
};
