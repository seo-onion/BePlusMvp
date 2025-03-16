const { SlashCommandBuilder } = require("discord.js");
const Items = require("../../models/Item/Items.js");
const Store = require("../../models/Store/Store.js");
const createAlertEmbed = require("../../utils/embed/alertEmbed");
const ROLE_ADMIN = process.env.ADMIN_ROLE;
const DEV = process.env.DEV_ROLE;

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

        // ✅ Validación de roles correcta (debe tener al menos uno de los dos roles)
        if (!member.roles.cache.has(DEV) && !member.roles.cache.has(ROLE_ADMIN)) {
            const embed = createAlertEmbed("🚫 No deberías estar probando estos comandos.");
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // ✅ Defiere la interacción al inicio para evitar el error
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
        }

        try {
            // Validar si el usuario tiene el rol de admin
            if (!member.roles.cache.has(ROLE_ADMIN)) {
                console.log("No tienes los permisos para ejecutar este comando, no eres admin.");
                return await interaction.editReply({
                    content: "⛔ No tienes permisos para ejecutar este comando.",
                });
            }

            // Validar que el precio no sea negativo
            if (price < 0) {
                return await interaction.editReply("❌ No se puede añadir productos con precio negativo.");
            }

            // Buscar o crear la tienda
            let store = await Store.findOne();
            if (!store) {
                store = await Store.create({ name: "Rocky Store" });
            }

            // Verificar si el ítem ya existe
            let item = await Items.findOne({
                where: { name: itemName, category }
            });

            if (item) {
                // ✅ Si el ítem existe, actualizar el precio
                item.price = price;
                await item.save();
                return await interaction.editReply(`✅ En la categoría **${category}** se ha actualizado el artículo **${itemName}** con un precio de ${price} RockyCoins.`);
            } else {
                // ✅ Si el ítem no existe, crearlo
                await Items.create({
                    name: itemName,
                    description: `Un ${category} del tipo ${itemName}`,
                    price,
                    category,
                    storeId: store.id,
                    badge: "coin",
                });

                return await interaction.editReply(`✅ En la categoría **${category}** se ha cargado el artículo **${itemName}** con un precio de ${price} RockyCoins.`);
            }
        } catch (error) {
            console.error("❌ Error al actualizar/añadir el artículo:", error);

            if (interaction.deferred || interaction.replied) {
                return await interaction.editReply("❌ Hubo un error al actualizar el artículo.");
            } else {
                return await interaction.reply("❌ Hubo un error al actualizar el artículo.");
            }
        }
    }
};
