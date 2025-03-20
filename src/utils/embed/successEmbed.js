const { EmbedBuilder } = require("discord.js");
const color = "#00FF00";

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
        .setImage("https://media.discordapp.net/attachments/1333263880566210561/1350718236991164509/error.jpeg?ex=67d7c1e2&is=67d67062&hm=a32431c778912f58e3a3cb25b1d99b1f12fc751a60eede2c934228539fb9a6ee&=&format=webp&width=930&height=930")
        .addFields(
            { name: "🔠 Categoría", value: `**${category}**`, inline: true },
            { name: "🛒 Artículo", value: `**${itemName}**`, inline: true },
            { name: "💰 Precio", value: `**${item?.price || "Desconocido"}** RockyCoins`, inline: true }
        )
        .setTimestamp();
};
