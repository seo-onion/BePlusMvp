const { EmbedBuilder } = require("discord.js");

module.exports = function alertEmbed(message) {
    return new EmbedBuilder()
        .setColor("#FFD700") 
        .setTitle("⚠️ No hay nada nuevo")
        .setDescription(message || "Parece que ya has reclamado esta recompensa o no hay logros nuevos para desbloquear.")
        .setImage("https://media.discordapp.net/attachments/1331719510243282986/1345191762691625051/error.jpeg?ex=67c4f874&is=67c3a6f4&hm=e3f3cf8c9abfeb32d22cf0c47586d9fa60d7d0aef00512095f143cf2f026f5f1&=&format=webp&width=890&height=890") 
        .setFooter({ text: "¡Sigue intentándolo! Pronto habrá más recompensas o logros para ti." })
        .setTimestamp();
};