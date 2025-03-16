const { SlashCommandBuilder } = require("discord.js");
const { ranking } = require("../../services/google/fitService");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rankearme")
        .setDescription("Revisa tus Rocky Gems"),

    restricted: true, // Restricts this command for specific users (like Beta Testers).

    async execute(interaction) { 
        await interaction.deferReply({ ephemeral: true }); // Defers the reply to avoid issues with editReply()

        const userId = interaction.user.id;

        try {
            // Retrieves the user's ranking from the service.
            const rank = await ranking(userId);

            // Sends the obtained message as a reply.
            return await interaction.editReply({
                content: rank.message,
            });

        } catch (error) {
            console.error("❌ Error al obtener el ranking:", error);
            return await interaction.editReply({
                content: "⚠️ Ocurrió un error al recuperar tu ranking. Intenta nuevamente más tarde.",
            });
        }
    },
};
