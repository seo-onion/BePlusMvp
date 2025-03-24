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
        .setImage("https://media.discordapp.net/attachments/1333263880566210561/1350712349753086022/ADAPTABLE_2.png?ex=67d7bc67&is=67d66ae7&hm=6e3e2c1bc23a34c6a501cc64300b7def7be7dd6733d8c0ab8dd1bc331883ebb2&=&format=webp&quality=lossless&width=250&height=250")
        .addFields(fields)
        .setTimestamp()
        .setFooter({ text: "Tienda Rocky • Bienvenido a la tienda Rocky." });

};
