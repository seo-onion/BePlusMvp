const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const GoogleFitService = require("../../services/google/fitService");
const alertEmbed = require("../../utils/embed/alertEmbed");
const createErrorEmbed = require("../../utils/embed/errorEmbed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reclamar")
        .setDescription("Convierte tus pasos en RockyCoins"),

    // Restricts the command for specific users or conditions.
    restricted: true,

    async execute(interaction) 

    {
        try {
            await interaction.deferReply() //  Prevent command timeout while processing the response
            
            const userId = interaction.user.id;

            // Attempts to claim RockyCoins for the userID.
            const claim = await GoogleFitService.claimRockyCoins(userId);

            // If the user has already claimed their reward for the day, send an alert message.
            if (!claim) {
                const alert = alertEmbed("⏳ Ya has reclamado la recompensa de hoy. Vuelve mañana para más RockyCoins. 🏃‍♂️💰");
                return await interaction.editReply({ embeds: [alert] });
            }

            console.log(`User with id: "${userId}" claimed ${claim} RockyCoins.`);

            // Constructs the success embed with details of the reward and send it
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

            // Ensures that a reply is only sent if one hasn't been already
            if (interaction.replied || interaction.deferred) {
                return await interaction.editReply({ embeds: [errorEmbed] });
            }
        }
    },
};
