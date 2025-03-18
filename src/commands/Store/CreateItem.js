const { SlashCommandBuilder } = require("discord.js");
const Items = require("../../models/Item/Items.js");
const Store = require("../../models/Store/Store.js");
const createAlertEmbed = require("../../utils/embed/alertEmbed");
const ROLE_ADMIN = process.env.ADMIN_ROLE;
const DEV = process.env.DEV_ROLE;
const ItemService = require("../../services/item/ItemService");

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

        const member = interaction.member;

        // Validate if the roles are correct (it should have one of them (ADMIN OR DEV))
        if (!member.roles.cache.has(DEV) && !member.roles.cache.has(ROLE_ADMIN)) {
            const embed = createAlertEmbed("🚫 No deberías estar probando estos comandos.");
            console.log("Entre aqui");
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Define the interaction at the beginning to avoid the error
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
        }

        try {
            // Validates if the user has the ROLE_ADMIN
            if (!member.roles.cache.has(ROLE_ADMIN)) {
                console.log("No tienes los permisos para ejecutar este comando, no eres admin.");
                return await interaction.editReply({
                    content: "⛔ No tienes permisos para ejecutar este comando.",
                });
            }

            // Validate if the price is greater than 0
            if (price < 0) {
                return await interaction.editReply("❌ No se puede añadir productos con precio negativo.");
            }

            // Finds or creates the Store
            let store = await Store.findOne();
            if (!store) {
                store = await Store.create({ name: "Rocky Store" });
            }

            // Verify is the item already exists
            let item = await Items.findOne({
                where: { name: itemName, category }
            });

            // If the Item exists, updates the price
            if (item) {
                await ItemService.updateItemPrice(item.id, price);
                return await interaction.editReply(
                    `✅ En la categoría **${category}** se ha actualizado el artículo **${itemName}** 
                    con un precio de ${price} RockyCoins.`);
            } else {
                // If the Item doesn't exist, it is created.
                await ItemService.createItem({
                    name: itemName,
                    price,
                    category,
                    storeId: store.id,
                });
                return await interaction.editReply(
                    `✅ En la categoría **${category}** se ha cargado el artículo
                     **${itemName}** con un precio de ${price} RockyCoins.`);
            }
        } catch (error) {
            console.error("❌ Error al actualizar/añadir el artículo:", error);

            if (interaction.deferred || interaction.replied) {
                return await interaction.editReply("❌ Hubo un error al actualizar el artículo.");
            }
            return await interaction.reply("❌ Hubo un error al actualizar el artículo.");
        }
    }
};
