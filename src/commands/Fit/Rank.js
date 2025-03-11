const { SlashCommandBuilder } = require("discord.js");
const { ranking } = require("../../services/google/fitService");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rankearme")
        .setDescription("Revisa tus Rocky Gems"),

    restricted: true, // ✅ Se restringe el comando para que solo Beta Testers lo usen

    async execute(interaction) { 
        await interaction.deferReply({ ephemeral: true }); // 🔄 Deferimos la respuesta para evitar errores con editReply()

        const userId = interaction.user.id;

        try {
            // 📌 Obtener el ranking del usuario
            const rank = await ranking(userId);

            // 📩 Responder con el mensaje obtenido del servicio
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
