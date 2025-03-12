
const { SlashCommandBuilder } = require("discord.js");
const Items = require("../../models/Item/Items.js");
const Store = require("../../models/Store/Store.js");
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
        if (!member.roles.cache.has(DEV) && !member.roles.cache.has(ADMIN)) {
            const embed = createAlertEmbed("🚫 No deberías estar probando estos comandos.");
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            const member = interaction.member;
            // Validar si el usuario tiene el rol de admin
            if (!member.roles.cache.has(ROLE_ADMIN) ) {
                console.log("No Tienes los permisos para ejecutar este comando, no eres admin ");
                return interaction.reply({
                    content: "⛔ No tienes permisos para ejecutar este comando.",
                    ephemeral: true
                });
            } else{
                console.log("Tienes los permisos para ejecutar este comando. ");
            }
            // Encuentra la Store, suponiendo que hay una sola
            if (price < 0){
                return interaction.reply("No se puede añadir productos con precio negativo ❌");
            }
            let store = await Store.findOne();
            if (!store) {
                store = await Store.create({ name: "Rocky Store" });
            }

            // Verifica si existe el item en la categoría
            let item = await Items.findOne({
                where: { name: itemName, category }
            });

            if (item) {
                // ✅ Si el ítem existe, actualiza el precio
                item.price = price;
                await item.save();
                return interaction.reply(`✅ En la categoría **${category}** se ha actualizado el artículo **${itemName}** con un precio de ${price} RockyCoins.`);
            } else {
                // ✅ Si el ítem no existe, créalo
                await Items.create({
                    name: itemName,
                    description: `Un ${category} del tipo ${itemName}`,
                    price,
                    category,
                    storeId: store.id,
                    badge: "coin",
                });

return interaction.reply(`✅ En la categoría **${category}** se ha cargado el artículo **${itemName}** con un precio de ${price} RockyCoins.`);
            }
        } catch (error) {
            console.error("❌ Error al actualizar/añadir el artículo:", error);
            return interaction.reply("❌ Hubo un error al actualizar el artículo.");
        }
    }
};
