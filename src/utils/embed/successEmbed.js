const { EmbedBuilder } = require("discord.js");
const color = "#00FF00";
//TODO: convert 1 embed
module.exports = function successEmbed({
                                           title = "Compra exitosa",
                                           item, // Se recibe el objeto item completo
                                           category = item?.category || "Desconocida",
                                           itemName = item?.name || "Desconocido"
                                       } = {}) {
    const description = `Has comprado de la categoría **${category}** el item **${itemName}** \n por **${item?.price || "Desconocido"}** RockyCoins! 🎉`;

    return new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)
        .setImage("https://media.discordapp.net/attachments/1351227753621618748/1358509639913832732/MARKETING_1_1.png?ex=67f41a32&is=67f2c8b2&hm=03f59fff0fb2c987092490b6e98c956d0b0108f854cc635e0c8f6b6e0104cf3f&=&format=webp&quality=lossless&width=952&height=952")
        .addFields(
            { name: "🔠 Categoría", value: `**${category}**`, inline: true },
            { name: "🛒 Artículo", value: `**${itemName}**`, inline: true },
            { name: "💰 Precio", value: `**${item?.price || "Desconocido"}** RockyCoins`, inline: true }
        )
        .setTimestamp();
};
