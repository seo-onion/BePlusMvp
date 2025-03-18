const { SlashCommandBuilder } = require("discord.js");
const googleFitEmbed = require("../../utils/embed/googleFitEmbed");

const URL = process.env.GOOGLE_URI;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("vincularmeconfit")
        .setDescription("Vincula tu cuenta de Discord con la aplicación de Google Fit"),

    restricted: true, // Restrict the command for Beta Testers only.

    async execute(interaction) {
        try {
            // Defer the reply only if it hasn't been deferred or replied to.
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ flags: 64 });
            }

            const userId = interaction.user.id;

            // Check if the GOOGLE_URI environment variable is defined.
            if (!URL) {
                console.error("❌ ERROR: The GOOGLE_URI environment variable is not defined.");
                return await interaction.editReply({
                    content: "⚠️ Error del sistema: No se ha configurado correctamente la URL de Google Fit.",
                });
            }

            const authUrl = `${URL}?id=${userId}`;

            // Final response: Edit the reply with the embed linking with Google Fit.
            return await interaction.editReply(
                { embeds: [ googleFitEmbed
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
                }
            );

        } catch (error) {
            console.error("❌ Error executing the /vincularmeconfit command:", error);

            // Proper error handling based on interaction state.
            if (interaction.deferred || interaction.replied) {
                return await interaction.editReply({
                    content: "❌ Ocurrió un error inesperado al procesar tu solicitud.",
                });
            } else {
                return await interaction.reply({
                    content: "❌ Ocurrió un error inesperado al procesar tu solicitud.",
                    flags: 64
                });
            }
        }
    },
};
