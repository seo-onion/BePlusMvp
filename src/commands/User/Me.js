const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const createErrorEmbed = require("../../utils/embed/errorEmbed");
const { getUserProfile } = require("../../services/user/userService");
const { getAchievementById } = require("../../services/achievement/achievementService");
const Users = require("../../models/User/Users");
const UserAchievements = require("../../models/Achievement/UserAchievements");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("yo")
    .setDescription("Muestra tu perfil y tus logros"),

  async execute(interaction) {
    try {
      const userId = interaction.user.id;

      // Obtener perfil del usuario
      const profile = await getUserProfile(userId);
      if (!profile) {
        const errorEmbed = createErrorEmbed("No se encontró tu perfil.");
        return await interaction.editReply({ embeds: [errorEmbed] });
      }

      // Obtener datos del usuario en la base de datos
      const userRecord = await Users.findByPk(userId);
      if (!userRecord) {
        return await interaction.editReply({
          content: "No se encontró tu perfil en la base de datos."
        });
      }

      // Obtener logros del usuario
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

      // Agregar logros si existen
      embed.addFields({
        name: "🏅 Logros Desbloqueados",
        value: achievementsDetails.length > 0
          ? achievementsDetails.map(a => `${a.emoji} **${a.name}**`).join("\n")
          : "Aún no tienes logros. ¡Desbloquea algunos usando `/desbloquear`!",
        inline: false
      });

      // Responder con el perfil
      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error("❌ Error al ejecutar el comando /yo:", error);
      const errorEmbed = createErrorEmbed("❌ Ocurrió un error inesperado.");

      // Manejar errores correctamente
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: [errorEmbed] });
      }
    }
  },
};
