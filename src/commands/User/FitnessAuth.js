const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const URL = process.env.GOOGLE_URI;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("vincularmeconfit")
        .setDescription("Vincula tu cuenta de Discord con la aplicación de Google Fit"),

    restricted: true, // ✅ Se restringe el comando para que solo Beta Testers lo usen

    async execute(interaction) {
        try {
            // ✅ Deferir solo si no ha sido respondido o deferido
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ flags: 64 });
            }

            const userId = interaction.user.id;

            // 🚨 Verificar si la variable de entorno está definida
            if (!URL) {
                console.error("❌ ERROR: La variable de entorno GOOGLE_URI no está definida.");
                return await interaction.editReply({
                    content: "⚠️ Error del sistema: No se ha configurado correctamente la URL de Google Fit.",
                });
            }

            const authUrl = `${URL}?id=${userId}`;

            // 🖼️ Crear el embed de vinculación con Google Fit
            const embed = new EmbedBuilder()
                .setColor("#34A853") // 🎨 Verde representativo de Google Fit
                .setTitle("📊 ¡Vincula tu cuenta con Google Fit!")
                .setDescription(
                    "Be Plus ahora puede sincronizarse con **Google Fit** para medir tu actividad física. 🏃‍♂️\n\n" +
                    "✅ **¿Cómo funciona?**\n" +
                    "🔹 Registra tus pasos diarios automáticamente.\n" +
                    "🔹 Convierte tu actividad en **Rocky Coins** y **Rocky Gems**. 🏆\n" +
                    "🔹 Mantén una racha activa y mejora tu productividad.\n\n" +
                    "⚠️ **Requisitos:**\n" +
                    "🔸 Debes tener una cuenta en **Google Fit**.\n" +
                    "🔸 Usar la aplicación móvil para registrar tu actividad física.\n\n" +
                    "🔗 **Haz clic en el siguiente enlace para vincular tu cuenta:**\n" +
                    `[📲 Conectar Google Fit](${authUrl})`
                )
                .setFooter({ text: "¡Empieza a moverte y gana recompensas!" });

            // 📩 Editar la respuesta final con el embed
            return await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("❌ Error al ejecutar el comando /vincularmeconfit:", error);

            // ✅ Manejo correcto de errores
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
