const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const createErrorEmbed = require("../../utils/errorEmbed");
const { getUserProfile } = require("../../services/user/userService");
const { getAchievementById } = require("../../services/achievement/achievementService");
const User = require("../../models/User/Users");
const UserAchievements = require("../../models/Achievement/UserAchievements");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("yo")
    .setDescription("Muestra tu perfil y tus logros"),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const userId = interaction.user.id;

    try {
      // Obtener el perfil del usuario
      const profile = await getUserProfile(userId);
      if (!profile) {
        const errorEmbed = createErrorEmbed("No se encontró tu perfil.");
        return interaction.editReply({ embeds: [errorEmbed] });
      }

      const userRecord = await User.findByPk(userId);
      if (!userRecord) {
        return interaction.editReply({
          content: "No se encontró tu perfil en la base de datos."
        });
      }

      // Obtener los logros del usuario
      const userAchievements = await UserAchievements.findAll({
        where: { userId },
        attributes: ["achievementId"]
      });

      const achievementIds = userAchievements.map(a => a.achievementId);
      const achievementsDetails = await Promise.all(achievementIds.map(getAchievementById));

      // Crear el embed del perfil
      const embed = new EmbedBuilder()
        .setColor("#00BFFF")
        .setTitle(`📜 Perfil de ${profile.name || profile.nickname || "Usuario"}`)
        .setDescription(profile.description || "Sin descripción")
        .addFields(
          { name: "👤 Nombre", value: profile.name || "No especificado", inline: true },
          { name: "🏷️ Apodo", value: profile.nickname || "No especificado", inline: true },
          { name: "📅 Edad", value: profile.age ? `${profile.age} años` : "No especificado", inline: true },
          { name: "⚧️ Género", value: profile.gender ? profile.gender.replace(/_/g, " ") : "No especificado", inline: true },
          { name: "🪙 RockyCoins", value: userRecord.rockyCoins ? `${userRecord.rockyCoins} RockyCoins` : "No especificado", inline: true },
          { name: "💎 RockyGems", value: userRecord.rockyGems ? `${userRecord.rockyGems} RockyGems` : "No especificado", inline: true }
        )
        .setFooter({ text: "¡Sigue progresando y desbloquea más logros!" })
        .setTimestamp();

      // Agregar logros al embed
      if (achievementsDetails.length > 0) {
        embed.addFields({
          name: "🏅 Logros Desbloqueados",
          value: achievementsDetails.map(a => `${a.emoji} **${a.name}**`).join("\n"),
          inline: false
        });
      } else {
        embed.addFields({
          name: "🏅 Logros Desbloqueados",
          value: "Aún no tienes logros. ¡Desbloquea algunos usando `/desbloquear`!",
          inline: false
        });
      }

      // Responder con el embed del perfil
      return await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error("❌ Error al ejecutar el comando /yo:", error);
      const errorEmbed = createErrorEmbed("❌ Ocurrió un error inesperado.");
      return interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
