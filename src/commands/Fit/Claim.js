const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { claimRockyCoins } = require("../../services/google/fitService");
const alertEmbed = require("../../utils/alertEmbed"); 
module.exports = {
    data: new SlashCommandBuilder()
        .setName("reclamar")
        .setDescription("Convierte tus pasos en RockyCoins"),

    async execute(interaction) {
        await interaction.deferReply();
        const id = interaction.user.id;

        const claim = await claimRockyCoins(id);
        if (!claim) {
            return interaction.editReply({ embeds: [alertEmbed("Ya has reclamado la recompensa de hoy. Vuelve mañana para más RockyCoins. 🏃‍♂️💰")], ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor("#FFD700")
            .setTitle("🎉 ¡RockyCoins Reclamadas!")
            .setDescription("Has convertido tus pasos en **RockyCoins** exitosamente.")
            .addFields({ name: "💰 RockyCoins obtenidas", value: `**${claim}** 🪙`, inline: true })
            .setFooter({ text: "¡Sigue caminando y gana más recompensas!" })
            .setTimestamp();

        return await interaction.editReply({ embeds: [embed] });
    },
};
