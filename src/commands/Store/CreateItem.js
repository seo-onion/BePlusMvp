const { SlashCommandBuilder } = require("discord.js");
const { Items } = require("../../models/Item/Items.js");
const { Store } = require("../../models/Store/Store.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("item")
        .setDescription("Añade o actualiza un artículo en la tienda.")
        .addStringOption(option =>
            option.setName("category")
                .setDescription("Nombre de la nueva categoría o una existente.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("item")
                .setDescription("Nombre del artículo que deseas añadir o actualizar.")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("price")
                .setDescription("Precio del artículo.")
                .setRequired(true)
        ),

    async execute(interaction) {
        const category = interaction.options.getString("category").toLowerCase();
        const itemName = interaction.options.getString("item");
        const price = interaction.options.getInteger("price");

        try {
            // Encuentra la Store, suponiendo que hay una sola
            let store = await Store.findOne();
            if (!store) {
                store = await Store.create({ name: "Rocky Store" });
            }

            // Verifica si es que existe el item que quieres poner:
            let item = await Items.findOne(
                { where: { name: itemName, category } }
            );

            if (item) {
                // ✅ If item exists, update the price
                item.price = price;
                await item.save();
                return interaction.reply(`✅ En la categoría **${category}** se ha actualizado el artículo **${itemName}** con el precio de ${price} RockyCoins.`);
            } else {
                // ✅ If item doesn't exist, create it
                await Items.create({
                    name: itemName,
                    description: `Un ${category} del tipo ${itemName}`,
                    price,
                    category,
                    storeId: store.id,
                    badge: "coin",
                });

                return interaction.reply(`✅ En la categoría **${category}** se ha cargado el artículo **${itemName}**con un precio de ${price} coins.`);
            }
        } catch (error) {
            console.error("❌ Error al actualizar/añadir el artículo:", error);
            return interaction.reply("❌ Hubo un error al actualizar el artículo.");
        }
    }
};
