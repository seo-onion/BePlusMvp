const { EmbedBuilder } = require("discord.js");
const color = "#FFA500";
//TODO: convert 1 embed
/** 
 * @param {string} title - Title of the embed
 * @param {string} description - Description of the embed
 * @param {Array<Object>} fields - Array of fields to be added to the embed
 * @returns {EmbedBuilder}
 */
module.exports = function alertEmbedList(
    title = "Mensaje de alerta con listas",
    description = "No tenemos lo que busca, pero tenemos esto: ",
    fields = []
) {
    const date = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

    // Add default fields like date if needed
    fields.push({
        name: "📅 Fecha",
        value: date,
        inline: true
    });

    return new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)
        .setImage("https://media.discordapp.net/attachments/1331719510243282986/1358065546867773613/EMOTES_2asasdad.PNG?ex=67f27c9a&is=67f12b1a&hm=eec0733369e55d9b6c7307301afe61b4f392457abc88861ed8caad1be1f6cb2a&=&format=webp&quality=lossless&width=250&height=250")
        .addFields(fields)
        .setTimestamp()
        .setFooter({ text: "Tienda Rocky • Bienvenido a la tienda Rocky." });

};
