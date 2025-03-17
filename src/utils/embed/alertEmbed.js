const { EmbedBuilder } = require("discord.js");
const color = "#FFD700";

module.exports = function alertEmbed(
    title = "Mensaje de alerta",
    description = "Ha ocurrido una situación inesperada.\nPor favor, revisa los detalles o intenta nuevamente más tarde.",
) {
    const date = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    return new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)
        .setImage("https://media.discordapp.net/attachments/1333263880566210561/1350712349753086022/ADAPTABLE_2.png?ex=67d7bc67&is=67d66ae7&hm=6e3e2c1bc23a34c6a501cc64300b7def7be7dd6733d8c0ab8dd1bc331883ebb2&=&format=webp&quality=lossless&width=250&height=250")
        .addFields(
            {
                name: "🚨",
                value: "**Si tienes dudas, contacta\ncon un administrador o \nrevisa las instrucciones.**",
                inline: false
            },
            {
                name: "📅",
                value: `**${date}**`,
                inline: true
            }
        )
        .setTimestamp();
};
