const { EmbedBuilder } = require("discord.js");
const { claimRockyCoins } = require("../../services/google/fitService");
const alertEmbed = require("../../utils/alertEmbed");
const createErrorEmbed = require("../../utils/errorEmbed");

module.exports = {
    data: {
        name: "reclamar",
        description: "Convierte tus pasos en RockyCoins",
    },

    restricted: true,

    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            console.log(`🔍 Intentando reclamar RockyCoins para el usuario: ${userId}`);

            const claim = await claimRockyCoins(userId);

            if (!claim) {
                const alert = alertEmbed("⏳ Ya has reclamado la recompensa de hoy. Vuelve mañana para más RockyCoins. 🏃‍♂️💰");
                return await interaction.editReply({ embeds: [alert] });
            }

            console.log(`✅ Usuario ${userId} reclamó ${claim} RockyCoins.`);

            const embed = new EmbedBuilder()
                .setColor("#FFD700")
                .setTitle("🎉 ¡RockyCoins Reclamadas!")
                .setDescription("Has convertido tus pasos en **RockyCoins** exitosamente. 🏆")
                .addFields({ name: "💰 RockyCoins obtenidas", value: `**${claim}** 🪙`, inline: true })
                .setFooter({ text: "¡Sigue caminando y gana más recompensas!" })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("❌ Error al reclamar RockyCoins:", error);
            const errorEmbed = createErrorEmbed("⚠️ Ocurrió un error inesperado al reclamar tus RockyCoins.");

            if (interaction.replied || interaction.deferred) {
                return await interaction.editReply({ embeds: [errorEmbed] });
            }
        }
    },
};
