const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const ROLE_ID = process.env.TESTER_ROLE;
const URL = process.env.GOOGLE_URI

module.exports = {
    data: new SlashCommandBuilder()
        .setName("vincularmeconfit")
        .setDescription("Vincula tu cuenta de Discord con la aplicacion de google fit"),

    async execute(interaction) {
        const Id = interaction.user.id;
        const authUrl = `${URL}?id=${Id}`;

        const embed = new EmbedBuilder()
        .setColor("#34A853")
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


        return await interaction.reply({
            embeds: [embed],
            flags: 64
            }

        );
    },
};