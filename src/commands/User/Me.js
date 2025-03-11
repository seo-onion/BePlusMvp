const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const createErrorEmbed = require("../../utils/errorEmbed");
const { getUserProfile } = require("../../services/user/userService");
const { getAchievementById } = require("../../services/achievement/achievementService");
const UserAchievements = require("../../models/Achievement/UserAchievements");
const TESTER_ROLE = process.env.TESTER_ROLE;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("yo")
    .setDescription("Muestra tu perfil y tus logros"),

  async execute(interaction) {
    const member = interaction.member;

    try {
      // ✅ Deferimos la respuesta antes de cualquier otra cosa
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ flags: 64 });
      }

      // ✅ Validación de roles después del defer
      if (!member.roles.cache.has(TESTER_ROLE)) {
        const errorEmbed = createErrorEmbed("🚫 No estás registrado en Be+ aún");
        return await interaction.editReply({ embeds: [errorEmbed] });
      }

      const userId = interaction.user.id;

      // ✅ Obtener el perfil del usuario
      const profile = await getUserProfile(userId);
      if (!profile) {
        const errorEmbed = createErrorEmbed("❌ No se encontró tu perfil.");
        return await interaction.editReply({ embeds: [errorEmbed] });
      }

      // ✅ Obtener los logros del usuario
      const userAchievements = await UserAchievements.findAll({
        where: { userId },
        attributes: ["achievementId"]
      });

      const achievementIds = userAchievements.map(a => a.achievementId);
      const achievementsDetails = await Promise.all(achievementIds.map(getAchievementById));

      // ✅ Crear el embed del perfil
      const embed = new EmbedBuilder()
        .setColor("#00BFFF")
        .setTitle(`📜 Perfil de ${profile.name || profile.nickname || "Usuario"}`)
        .setDescription(profile.description || "Sin descripción")
        .addFields(
          { name: "👤 Nombre", value: profile.name || "No especificado", inline: true },
          { name: "🏷️ Apodo", value: profile.nickname || "No especificado", inline: true },
          { name: "📅 Edad", value: profile.age ? `${profile.age} años` : "No especificado", inline: true },
          { name: "⚧️ Género", value: profile.gender ? profile.gender.replace(/_/g, " ") : "No especificado", inline: true }
        )
        .setFooter({ text: "¡Sigue progresando y desbloquea más logros!" })
        .setTimestamp();

      // ✅ Añadir logros al embed si existen
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

      // ✅ Editar la respuesta final
      return await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error("❌ Error al ejecutar el comando /yo:", error);
      const errorEmbed = createErrorEmbed("❌ Ocurrió un error inesperado.");

      // ✅ Evitar múltiples respuestas
      if (interaction.deferred || interaction.replied) {
        return await interaction.editReply({ embeds: [errorEmbed] });
      } else {
        return await interaction.reply({ embeds: [errorEmbed], flags: 64 });
      }
    }
  },
};
