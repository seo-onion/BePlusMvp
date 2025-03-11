const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { Items } = require("../../models/Item/Items.js");
const { Store } = require("../../models/Store/Store.js");
const createAlertEmbed = require("../../utils/alertEmbed"); 

const DEV = process.env.DEV_ROLE;
const ADMIN = process.env.ADMIN_ROLE;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("item")
        .setDescription("Añade o actualiza un artículo en la tienda.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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
            // Encuentra la Store, suponiendo que hay una sola
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
                return interaction.reply(`✅ En la categoría **${category}** se ha actualizado el artículo **${itemName}** con el precio de ${price} RockyCoins.`);
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

                return interaction.reply(`✅ En la categoría **${category}** se ha cargado el artículo **${itemName}** con un precio de ${price} coins.`);
            }
        } catch (error) {
            console.error("❌ Error al actualizar/añadir el artículo:", error);
            return interaction.reply("❌ Hubo un error al actualizar el artículo.");
        }
    }
};
