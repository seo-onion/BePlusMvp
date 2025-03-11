const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { claimRockyCoins } = require("../../services/google/fitService");
const alertEmbed = require("../../utils/alertEmbed");
const createErrorEmbed = require("../../utils/errorEmbed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reclamar")
        .setDescription("Convierte tus pasos en RockyCoins"),

    restricted: true, // ✅ Se restringe el comando para que solo Beta Testers lo usen

    async execute(interaction) {
        try {
            // ✅ Defer la respuesta solo si no ha sido deferida o respondida
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ flags: 64 });
            }

            const userId = interaction.user.id;

            // 📌 Intentar reclamar las RockyCoins
            const claim = await claimRockyCoins(userId);

            // 🚨 Si ya reclamó la recompensa
            if (!claim) {
                const alert = alertEmbed("⏳ Ya has reclamado la recompensa de hoy. Vuelve mañana para más RockyCoins. 🏃‍♂️💰");
                return await interaction.editReply({ embeds: [alert] });
            }

            // 🎉 Crear un embed para mostrar la recompensa obtenida
            const embed = new EmbedBuilder()
                .setColor("#FFD700") // 🎨 Dorado para indicar una recompensa
                .setTitle("🎉 ¡RockyCoins Reclamadas!")
                .setDescription("Has convertido tus pasos en **RockyCoins** exitosamente. 🏆")
                .addFields({ name: "💰 RockyCoins obtenidas", value: `**${claim}** 🪙`, inline: true })
                .setFooter({ text: "¡Sigue caminando y gana más recompensas!" })
                .setTimestamp();

            return await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("❌ Error al reclamar RockyCoins:", error);
            const errorEmbed = createErrorEmbed("⚠️ Ocurrió un error inesperado al reclamar tus RockyCoins.");

            // ✅ Manejo correcto de errores según el estado de la interacción
            if (interaction.deferred || interaction.replied) {
                return await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                return await interaction.reply({ embeds: [errorEmbed], flags: 64 });
            }
        }
    },
};
