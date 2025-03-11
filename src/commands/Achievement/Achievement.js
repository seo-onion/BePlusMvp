const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const AchievementGetService = require("../../services/achievement/achievementGetService");
const { getUserAchievementById, getAchievementByName } = require("../../services/achievement/achievementService");
const { addRockyGems } = require("../../services/item/economyService");
const alertEmbed = require("../../utils/alertEmbed");
const createErrorEmbed = require("../../utils/errorEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("desbloquear")
    .setDescription("Desbloquea un logro en el sistema de recompensas"),

  restricted: true, // ✅ Se restringe este comando para que solo Beta Testers lo usen

  async execute(interaction) {
    try {
      // ✅ Deferimos la respuesta solo si no ha sido deferida o respondida
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ flags: 64 });
      }

      const userId = interaction.user.id;
      let achievementsObtained = [];

      // 📜 Lista de logros disponibles y su método de desbloqueo
      const achievements = [
        { name: "Primer Paso", emoji: "👣", method: () => AchievementGetService.firstStep(userId) },
        { name: "10k Club", emoji: "♂️🏃‍♂️", method: () => AchievementGetService.tenK(userId) },
        { name: "Maratonista", emoji: "🏃‍♀️🏅", method: () => AchievementGetService.marathoner(userId) },
        { name: "100k Walker", emoji: "⚡👟", method: () => AchievementGetService.hundredKWalker(userId) },
      ];

      for (const achievement of achievements) {
        try {
          const achievementData = await getAchievementByName(achievement.name);
          const achievementId = achievementData.id;

          // 📌 Verificar si el usuario ya tiene el logro
          const existingAchievement = await getUserAchievementById({ userId, achievementId });

          if (!existingAchievement) {
            const unlockedAchievement = await achievement.method();

            if (unlockedAchievement) {
              achievementsObtained.push({
                name: unlockedAchievement.name,
                description: achievementData.description,
                emoji: achievement.emoji,
              });

              // 💎 Agregar recompensas (Rocky Gems) al usuario
              await addRockyGems({ userId, quantity: unlockedAchievement.point });

              console.log(`✅ Logro desbloqueado: ${unlockedAchievement.name}`);
            } else {
              console.log(`⚠️ No se cumplieron los requisitos para "${achievement.name}"`);
            }
          }
        } catch (error) {
          console.error(`❌ Error al procesar el logro "${achievement.name}":`, error);
        }
      }

      // 🚫 Si no se desbloqueó ningún logro, mostrar una alerta amigable
      if (achievementsObtained.length === 0) {
        const alert = alertEmbed("🚀 No has desbloqueado ningún logro nuevo. ¡Sigue esforzándote!");
        return await interaction.editReply({ embeds: [alert] });
      }

      // 🏆 Crear un embed con los logros desbloqueados
      const embed = new EmbedBuilder()
        .setColor("#FFD700") // 🎨 Color dorado para representar logros
        .setTitle("🏅 ¡Nuevos Logros Desbloqueados!")
        .setDescription("Has logrado grandes avances y desbloqueaste los siguientes logros:")
        .setThumbnail("https://i.imgur.com/Yk4p2Ox.png") // 🖼 Imagen representativa de logros
        .setTimestamp();

      // 📌 Agregar cada logro como un campo en el embed
      achievementsObtained.forEach(ach => {
        embed.addFields({
          name: `${ach.emoji} ${ach.name}`,
          value: ach.description,
          inline: false,
        });
      });

      return await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error("❌ Error al ejecutar el comando:", error);
      const errorEmbed = createErrorEmbed("⚠️ Ocurrió un error inesperado al procesar tus logros.");

      if (interaction.deferred || interaction.replied) {
        return await interaction.editReply({ embeds: [errorEmbed] });
      } else {
        return await interaction.reply({ embeds: [errorEmbed], flags: 64 });
      }
    }
  },
};
