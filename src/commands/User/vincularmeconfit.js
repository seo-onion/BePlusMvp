const { SlashCommandBuilder } = require("discord.js");
const googleFitEmbed = require("../../utils/embed/googleFitEmbed");
const createErrorEmbed = require("../../utils/embed/errorEmbed")
const URL = process.env.GOOGLE_URI;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("vincularmeconfit")
        .setDescription("Vincula tu cuenta de Discord con la aplicación de Google Fit"),
    restricted: true,

    async execute(interaction) {
        try {
            const userId = interaction.user.id;

            const authUrl = `${URL}?id=${userId}`;

            // Final response: Edit the reply with the embed linking with Google Fit.
            return await interaction.reply(
                {
                    embeds: [googleFitEmbed
                        ({
                            title: "📊 ¡Vincula tu cuenta con Google Fit!",
                            description: "Be Plus ahora puede sincronizarse con **Google Fit** para medir tu actividad física. 🏃‍♂️\n\n" +
                                "✅ **¿Cómo funciona?**\n" +
                                "🔹 Registra tus pasos diarios automáticamente.\n" +
                                "🔹 Convierte tu actividad en **Rocky Coins** y **Rocky Gems**. 🏆\n" +
                                "🔹 Mantén una racha activa y mejora tu productividad.\n\n" +
                                "⚠️ **Requisitos:**\n" +
                                "🔸 Debes tener una cuenta en **Google Fit**.\n" +
                                "🔸 Usar la aplicación móvil para registrar tu actividad física.\n\n" +
                                "🔗 **Haz clic en el siguiente enlace para vincular tu cuenta:**\n" +
                                `[📲 Conectar Google Fit](${authUrl})`
                        })]
                    , ephemeral: true
                }
            );

        } catch (error) {
            console.error("Error executing /v<incularmeconfit ", error);
            const errorEmbed = createErrorEmbed();
            return await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
