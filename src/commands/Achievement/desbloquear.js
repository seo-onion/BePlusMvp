const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const AchievementGetService = require("../../services/achievement/achievementGetService");
const AchievementService = require("../../services/achievement/achievementService")
const economyService = require("../../services/item/economyService")
const alertEmbed = require("../../utils/embed/alertEmbed");
const createErrorEmbed = require("../../utils/embed/errorEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("desbloquear")
    .setDescription("Desbloquea un logro en el sistema de recompensas"),
  restricted: true,

  async execute(interaction) {
    try {
      // Defers the reply to prevent timeout issues during processing.
      await interaction.deferReply({ ephemeral: true });

      const userId = interaction.user.id;
      let achievementsObtained = [];

      // List of available achievements and their unlocking method.
      const achievements = [
        { name: "Primer Paso", emoji: "👣", method: () => AchievementGetService.firstStep(userId) },
        { name: "10k Club", emoji: "♂️🏃‍♂️", method: () => AchievementGetService.tenK(userId) },
        { name: "Maratonista", emoji: "🏃‍♀️🏅", method: () => AchievementGetService.marathoner(userId) },
        { name: "100k Walker", emoji: "⚡👟", method: () => AchievementGetService.hundredKWalker(userId) },
      ];

      for (const achievement of achievements) {
        try {
          const achievementData = await AchievementService.getAchievementByName(achievement.name);
          const achievementId = achievementData.id;

          // Checks if the user already has the achievement.
          const existingAchievement = await AchievementService.getUserAchievementById({ userId, achievementId });

          if (!existingAchievement) {
            const unlockedAchievement = await achievement.method();

            if (unlockedAchievement) {
              achievementsObtained.push({
                name: unlockedAchievement.name,
                description: achievementData.description,
                emoji: achievement.emoji,
              });

              // Adds Rocky Gems to the user as a reward for unlocking the achievement.
              await economyService.addRockyGems({ userId, quantity: unlockedAchievement.point });

              console.log(`✅ Logro desbloqueado: ${unlockedAchievement.name}`);
            } else {
              console.log(`⚠️ No se cumplieron los requisitos para "${achievement.name}"`);
            }
          }
        } catch (error) {
          console.error(`❌ Error al procesar el logro "${achievement.name}":`, error);
        }
      }

      // If no achievements were unlocked, send an alert message.
      if (achievementsObtained.length === 0) {
        const alertEmbed = alertEmbed("🚀 No has desbloqueado ningún logro nuevo. ¡Sigue esforzándote!");
        return await interaction.editReply({ embeds: [alertEmbed], ephemeral: true });
      }

      // Creates an embed displaying the newly unlocked achievements.
      const embed = new EmbedBuilder()
        .setColor("#FFD700") // Gold color representing achievements.
        .setTitle("🏅 ¡Nuevos Logros Desbloqueados!")
        .setDescription("Has logrado grandes avances y desbloqueaste los siguientes logros:")
        .setThumbnail("https://i.imgur.com/Yk4p2Ox.png")
        .setTimestamp();

      // Adds each unlocked achievement to the embed.
      achievementsObtained.forEach(ach => {
        embed.addFields({
          name: `${ach.emoji} ${ach.name}`,
          value: ach.description,
          inline: false,
        });
      });

      return await interaction.editReply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error("❌ Error al ejecutar el comando:", error);
      const errorEmbed = createErrorEmbed(
        {
          title: "⚠️ Ocurrió un error inesperado al procesar tus logros.",
        });

      return await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
