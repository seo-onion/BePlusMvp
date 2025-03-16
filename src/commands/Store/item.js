// 📌 src/commands/Store/item.js
const { SlashCommandBuilder } = require("discord.js");
const Items = require("../../models/Item/Items");
const Store = require("../../models/Store/Store");
const createAlertEmbed = require("../../utils/alertEmbed");

const ROLE_ADMIN = process.env.ADMIN_ROLE;
const DEV = process.env.DEV_ROLE;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("item")
        .setDescription("Agrega o actualiza un artículo en la tienda Rocky.")
        .addStringOption(option =>
            option.setName("category")
                .setDescription("Categoría nueva o existente del artículo.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("item")
                .setDescription("Nombre del artículo que deseas agregar o actualizar.")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("price")
                .setDescription("Precio del artículo.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("imagen_url")
                .setDescription("URL de la imagen del artículo (opcional).")
                .setRequired(false)
        ),

    /**
     * Creates or updates an item in the Rockie Store.
     * @param {import("discord.js").ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const category = interaction.options.getString("category").toLowerCase();
        const itemName = interaction.options.getString("item");
        const price = interaction.options.getInteger("price");
        const imageUrl = interaction.options.getString("imagen_url");

        const member = interaction.member;

        // ✅ Check user permissions
        if (!member.roles.cache.has(DEV) && !member.roles.cache.has(ROLE_ADMIN)) {
            const embed = createAlertEmbed("🚫 No deberías estar probando estos comandos.");
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            if (price < 0) {
                return await interaction.editReply("❌ No se puede asignar un precio negativo.");
            }

            let store = await Store.findOne();
            if (!store) {
                store = await Store.create({ name: "Rocky Store" });
            }

            let item = await Items.findOne({ where: { name: itemName, category } });

            if (item) {
                item.price = price;
                if (imageUrl) item.imageUrl = imageUrl;
                await item.save();

                return await interaction.editReply(`✅ El artículo **${itemName}** en la categoría **${category}** ha sido actualizado con un precio de ${price} RockyCoins.`);
            } else {
                await Items.create({
                    name: itemName,
                    description: `Un ${category} del tipo ${itemName}`,
                    price,
                    category,
                    storeId: store.id,
                    badge: "coin",
                    imageUrl: imageUrl || null
                });

                return await interaction.editReply(`✅ El artículo **${itemName}** en la categoría **${category}** ha sido creado con un precio de ${price} RockyCoins.`);
            }
        } catch (error) {
            console.error("❌ Error al manejar el artículo:", error);

            const errorMsg = "❌ Hubo un error al procesar el artículo.";
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(errorMsg);
            } else {
                await interaction.reply({ content: errorMsg, ephemeral: true });
            }
        }
    }
};

