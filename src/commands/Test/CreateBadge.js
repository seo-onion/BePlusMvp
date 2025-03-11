const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { createBadges } = require("../../services/item/economyService");
const createAlertEmbed = require("../../utils/alertEmbed");

const DEV = process.env.DEV_ROLE;
const ADMIN = process.env.ADMIN_ROLE;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("creardivisas")
    .setDescription("Crea las divisas en el sistema de economía.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const member = interaction.member;

    // ✅ Validación de roles
    if (!member.roles.cache.has(DEV) && !member.roles.cache.has(ADMIN)) {
      const embed = createAlertEmbed("🚫 No tienes permisos para ejecutar este comando.");
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    try {
      await createBadges();
      return await interaction.reply({
        content: `✅ Las divisas han sido creadas correctamente.`,
        ephemeral: true
      });
    } catch (error) {
      console.error("❌ Error al crear divisas:", error);
      return await interaction.reply({
        content: "❌ Ocurrió un error al intentar crear las divisas.",
        ephemeral: true
      });
    }
  },
};
