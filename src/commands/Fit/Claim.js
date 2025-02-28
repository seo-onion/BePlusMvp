const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { claimRockyCoins } = require("../../services/google/fitService")

module.exports = {
    // Setting SlashComandBuilder
    data: new SlashCommandBuilder()
        .setName("reclamar")
        .setDescription("Convierte tus pasos en RockyCoins"),

    async execute(interaction) {
        await interaction.deferReply();
        const id = interaction.user.id
        
        const claim = await claimRockyCoins(id);

        return (
            await interaction.editReply({
                content: claim.message,
                flags: 64 
            })
        )
        },
    };
