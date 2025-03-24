const { EmbedBuilder } = require("discord.js");
const color = "#34A853";
//TODO: convert 1 embed
module.exports = function errorEmbed({
                                         title = "Vinculación con Google Fit",
                                         description = "Bienvenido a GoogleFit.",
                                     } = {}) {
    const date = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    return new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)
        .setImage("https://media.discordapp.net/attachments/1331719510243282986/1345217857117618186/WhatsApp_Image_2025-02-28_at_5.27.07_AM1.jpeg")
        .setTimestamp()
        .setFooter({ text: "¡Empieza a moverte y gana recompensas!" });
};
