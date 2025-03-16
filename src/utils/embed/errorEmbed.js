const { EmbedBuilder } = require("discord.js");

module.exports = function errorEmbed({
    title = "Error desconocido",
    description = "Hubo un problema desconocido al ejecutar el comando."
} = {}) {
    const date = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    return new EmbedBuilder()    
        .setColor("#FF0000") 
        .setTitle(title)
        .setDescription(description)
        .setImage("https://media.discordapp.net/attachments/1333263880566210561/1350718236991164509/error.jpeg?ex=67d7c1e2&is=67d67062&hm=a32431c778912f58e3a3cb25b1d99b1f12fc751a60eede2c934228539fb9a6ee&=&format=webp&width=930&height=930")
        .addFields(
            {
                name: "🚨",
                value: "**Por favor, contacta con un \nadministrador o repórtalo \npara resolver este problema \nlo antes posible.**",
                inline: true
            },
            {
                name: "📅",
                value: date,
                inline: true
            }
        )
        .setTimestamp();
};
