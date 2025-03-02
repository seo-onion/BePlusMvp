const { EmbedBuilder } = require("discord.js");

module.exports = function createErrorEmbed(errorName) {
    return new EmbedBuilder()
        .setColor("#FF0000") // Rojo para errores
        .setTitle("❌ Ocurrió un Error")
        .setDescription(`Hubo un problema al ejecutar el comando. Por favor, intenta de nuevo más tarde.`)
        .addFields({ name: "🔴 Error", value: `**${errorName}**`, inline: false })
        .setImage("https://media.discordapp.net/attachments/1331719510243282986/1345191762691625051/error.jpeg?ex=67c3a6f4&is=67c25574&hm=8ca21cf9fae3311f3fce55e8241a9e9a77693f5fb965edc04702ad7c11b4d377&=&format=webp&width=890&height=890")
        .setFooter({ text: "Si el problema persiste, contacta con un administrador." })
        .setTimestamp();
};
