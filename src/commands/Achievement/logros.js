const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const AchievementService = require("../../services/achievement/achievementService");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("logros")
        .setDescription("Muestra todos los logros disponibles en B+"),
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const achievements = await AchievementService.getAllAchievements();

            if (!achievements || achievements.length === 0) {
                return interaction.editReply({
                    content: "❌ No hay logros disponibles actualmente.",
                });
            }

            const embed = new EmbedBuilder()
                .setTitle("🎯 Logros Disponibles en B+")
                .setColor("#FFD700")
                .setDescription("Aquí están los logros que puedes obtener:")
                .setFooter({ text: "¡Sigue caminando y desbloquea todos los logros!" })
                .setTimestamp();

            for (const achievement of achievements) {
                embed.addFields({
                    name: `${achievement.emoji || "🎖️"} ${achievement.name}`,
                    value: `📝 ${achievement.description} — **${achievement.point || 0} rockyCoins**`,
                    inline: false,
                });
            }

            await interaction.editReply({ embeds: [embed], ephemeral:true });

        } catch (error) {
            console.error("❌ Error al obtener los logros:", error);
            return interaction.editReply({
                content: "Ocurrió un error al cargar los logros. Intenta más tarde.",
            });
        }
    }
};
