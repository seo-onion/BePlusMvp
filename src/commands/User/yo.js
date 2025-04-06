const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const createErrorEmbed = require("../../utils/embed/errorEmbed");
const UserService = require("../../services/user/userService");
const { getAchievementById } = require("../../services/achievement/achievementService");
const UserAchievements = require("../../models/Achievement/UserAchievements");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("yo")
    .setDescription("Muestra tu perfil y tus logros"),
  restricted: true,

  async execute(interaction) {
    try {
      await interaction.deferReply({ephemeral: true}); //  Prevent command timeout while processing the response

      const userId = interaction.user.id;

      //  Retrieve user data
      const userData = await UserService.getUser(userId);
      if (!userData) {
        const errorEmbed = createErrorEmbed({
          title: "No se encontró tu perfil",
          description: "Parece que aún no tienes un perfil registrado en el sistema."
        });
        return await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
      }

      const user = userData.toJSON();
      const profile = user.Profile;

      //  Check if the user has a profile
      if (!profile) {
        const errorEmbed = createErrorEmbed({
          title: "Perfil no encontrado",
          description: "Tu perfil no contiene información suficiente. Intenta actualizarlo."
        });
        return await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
      }

      //  Retrieve user achievements
      const userAchievements = await UserAchievements.findAll({
        where: { userId },
        attributes: ["achievementId"]
      });

      const achievementIds = userAchievements.map(a => a.achievementId);
      const achievementsDetails = await Promise.all(achievementIds.map(getAchievementById));

      //  Create the profile embed
      const embed = new EmbedBuilder()
        .setColor("#00BFFF")
        .setTitle(`📜 Perfil de ${profile.name || profile.nickname || "Usuario"}`)
        .setDescription(profile.description || "Sin descripción")
        .addFields(
          { name: "👤 Nombre", value: profile.name || "No especificado", inline: true },
          { name: "🏷️ Apodo", value: profile.nickname || "No especificado", inline: true },
          { name: "📅 Edad", value: profile.age ? `${profile.age} años` : "No especificado", inline: true },
          { name: "⚧️ Género", value: profile.gender ? profile.gender.replace(/_/g, " ") : "No especificado", inline: true },
          { name: "🪙 RockyCoins", value: user.rockyCoins ? `${user.rockyCoins} RockyCoins` : "0 RockyCoins", inline: true },
          { name: "💎 RockyGems", value: user.rockyGems ? `${user.rockyGems} RockyGems` : "0 RockyGems", inline: true }
        )
        .setFooter({ text: "¡Sigue progresando y desbloquea más logros!" })
        .setTimestamp();

      // Add user achievements
      embed.addFields({
        name: "🏅 Logros Desbloqueados",
        value: achievementsDetails.length > 0
          ? achievementsDetails.map(a => `${a.emoji} **${a.name}**`).join("\n")
          : "Aún no tienes logros. ¡Desbloquea algunos usando `/desbloquear`!",
        inline: false
      });

      // Send the final embed
      await interaction.editReply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error("Error executing /yo command:", error);
      const errorEmbed = createErrorEmbed();
      
      await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });

    }
  },
};
