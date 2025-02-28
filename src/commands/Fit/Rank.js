const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { ranking } = require("../../services/google/fitService")

module.exports = {
    // Setting SlashComander Builder
    data: new SlashCommandBuilder()
        .setName("rankearme")
        .setDescription("Revisa tus rockyGems"),

    // Represents when the user users /rankeame
    async execute(interaction) { 
        await interaction.deferReply();
        const id = interaction.user.id
        
        const rank = await ranking(id);

        return (
            await interaction.editReply({
                content: rank.message,
                flags: 64
            })
        )
    },
};
