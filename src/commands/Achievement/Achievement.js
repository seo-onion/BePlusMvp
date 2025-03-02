const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const AchievementGetService = require("../../services/achievement/achievementGetService");
const { getUserAchievementById, getAchievementByName } = require("../../services/achievement/achievementService");
const { addRockyGems } = require("../../services/item/economyService");
const alertEmbed = require("../../utils/alertEmbed"); // Importamos la función de embed neutral

module.exports = {
  data: new SlashCommandBuilder()
    .setName("desbloquear")
    .setDescription("Desbloquea un logro en el sistema de recompensas"),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 }); // Usamos flags en vez de ephemeral

    const userId = interaction.user.id;
    let achievementsObtained = [];

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

        const existingAchievement = await getUserAchievementById({ userId, achievementId });

        if (!existingAchievement) {
          const unlockedAchievement = await achievement.method();

          if (unlockedAchievement) {
            achievementsObtained.push({
              name: unlockedAchievement.name,
              description: achievementData.description,
              emoji: achievement.emoji,
            });
            addRockyGems({ userId: userId, quantity: unlockedAchievement.point });

            console.log(`✅ Logro desbloqueado: ${unlockedAchievement.name}`);
          } else {
            console.log(`⚠️ No se cumplieron los requisitos para "${achievement.name}"`);
          }
        }
      } catch (error) {
        console.error(`❌ Error al procesar el logro "${achievement.name}":`, error);
      }
    }

    // Si no se desbloqueó ningún logro, mostrar un embed con la nueva función
    if (achievementsObtained.length === 0) {
      return interaction.editReply({ embeds: [alertEmbed("No has desbloqueado ningún logro nuevo. ¡Sigue esforzándote! 🚀")] });
    }

    // 🎨 Crear un embed para mostrar los logros desbloqueados
    const embed = new EmbedBuilder()
      .setColor("#FFD700") // Dorado para representar logros
      .setTitle("🏅 ¡Nuevos Logros Desbloqueados!")
      .setDescription("Has logrado grandes avances y desbloqueaste los siguientes logros:")
      .setThumbnail("https://i.imgur.com/Yk4p2Ox.png") // Puedes cambiarlo por la imagen que subiste
      .setTimestamp();

    // Agregar cada logro como un campo en el embed
    achievementsObtained.forEach(ach => {
      embed.addFields({
        name: `${ach.emoji} ${ach.name}`,
        value: ach.description,
        inline: false,
      });
    });

    return await interaction.editReply({ embeds: [embed] });
  },
};
