const { SlashCommandBuilder } = require("discord.js");
const errorEmbed = require("../../utils/embed/errorEmbed");
const alertEmbedList = require("../../utils/embed/alertEmbedList");
const successEmbed = require("../../utils/embed/successEmbed");
const ListObjectsFormat = require("../../utils/ListObjects");
const ItemService = require("../../services/item/ItemService");
const UserService = require("../../services/user/userService")
const UserItemsService = require("../../services/user/userItemsService");
const Items = require("../../models/Item/Items");

// Pre-fetch categories
let categoryChoices = [];

async function loadCategories() {
    try {
        const categories = await Items.findAll({
            attributes: ['category'],
            group: ['category'],
            raw: true
        });
        categoryChoices = categories.map(cat => ({ name: cat.category, value: cat.category }));
        console.log("✅ Categories loaded:", categoryChoices);
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

loadCategories();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("comprar")
        .setDescription("Compra un artículo de la tienda Rocky.")
        .addStringOption(option =>
            option.setName("category")
                .setDescription("Elige una categoría de artículos")
                .setRequired(true)
                .addChoices(...categoryChoices)
        )
        .addStringOption(option =>
            option.setName("item")
                .setDescription("Nombre del artículo que deseas comprar")
                .setRequired(true)
        ),

    restricted: true,

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const category = interaction.options.getString("category");
        const itemName = interaction.options.getString("item");
        const userId = interaction.user.id;

        try {
            const item = await ItemService.buyItem({userId, itemName, category});

            if (!item) {
                
                const user = await UserService.getUser(userId);
                const categoryExists = await Items.findOne({ where: { category }, raw: true });

                if (!categoryExists) {
                    const allCategories = await Items.findAll({
                        attributes: ['category'],
                        group: ['category'],
                        raw: true
                    });
                    const formattedCategories = allCategories.length > 0
                        ? `\`\`\`yaml\n${allCategories.map(c => `- ${c.category}`).join("\n")}\n\`\`\``
                        : "❌ No hay categorías disponibles.";

                    return interaction.editReply({
                        embeds: [alertEmbedList("❌ Categoría No Encontrada",
                            `La categoría **${category}** no existe.`,
                            [{ name: "📂 Categorías Disponibles", value: formattedCategories }]
                        )]
                    });
                }

                const itemInCategory = await ItemService.getItemByCategoryAndName({ category, name: itemName })

                if (!itemInCategory) {
                    const categoryItems = await ItemService.getAllItemsByCategory(category, ["name", "price"]);
                    return interaction.editReply({
                        embeds: [alertEmbedList("⚠️ Artículo No Encontrado",
                            `El artículo **${itemName}** no existe en la categoría **${category}**, pero aquí están los artículos disponibles:`,
                            [{
                                name: `📂 Artículos en ${category}`,
                                value: ListObjectsFormat(categoryItems, "❌ No hay artículos en esta categoría.")
                            }]
                        )]
                    });
                }

                if (!user) {
                    return interaction.editReply({
                        embeds: [createErrorEmbed({
                            title: "❌ Usuario No Encontrado",
                            description: "No se pudo encontrar tu perfil en la base de datos."
                        })]
                    });
                }

                const alreadyHasItem = await UserItemsService.hasUserItem({userId, itemId: itemInCategory.id});
                if (alreadyHasItem) {
                    const allItems = await ItemService.getAllItemsByCategory(category);
                    const userItems = await UserItemsService.getAllItemsByUser(userId);
                    const ownedIds = userItems.map(i => i.itemId);
                    const ownedItems = allItems.filter(i => ownedIds.includes(i.id));
                    const unownedItems = allItems.filter(i => !ownedIds.includes(i.id));

                    return interaction.editReply({
                        embeds: [alertEmbedList("⚠️ Artículo Ya Comprado",
                            `Ya tienes **${itemName}** en tu inventario.`,
                            [
                                {
                                    name: "🎭 Otros Accesorios Disponibles",
                                    value: ListObjectsFormat(unownedItems, "❌ No hay otros accesorios disponibles en esta categoría."),
                                    inline: true
                                },
                                {
                                    name: "🛑 Accesorios que ya posees",
                                    value: ListObjectsFormat(ownedItems, "No tienes otros accesorios en esta categoría."),
                                    inline: true
                                }
                            ]
                        )]
                    });
                }

                if (user.rockyCoins < itemInCategory.price) {
                    const categoryItems = await ItemService.getAllItemsByCategory(category);
                    const userItems = await UserItemsService.getAllItemsByUser(userId);
                    const ownedIds = userItems.map(i => i.itemId);
                    const affordableUnowned = categoryItems.filter(i =>
                        i.price <= user.rockyCoins && !ownedIds.includes(i.id)
                    );

                    return interaction.editReply({
                        embeds: [alertEmbedList("❌ Fondos Insuficientes",
                            `Necesitas **${itemInCategory.price}** RockyCoins para comprar **${itemName}**. Actualmente tienes **${user.rockyCoins}**.`,
                            [{
                                name: "🎭 Puedes comprar estos artículos:",
                                value: ListObjectsFormat(affordableUnowned, "❌ No puedes comprar ningún artículo con tu saldo actual.")
                            }]
                        )]
                    });
                }

                return interaction.editReply({
                    content: "❌ No se pudo completar la compra. Intenta nuevamente.",
                });
            }

            return interaction.editReply({
                embeds: [successEmbed({
                    item,
                    category: item.category,
                    itemName: item.name,
                })]
            });

        } catch (error) {
            console.error("❌ Error en /comprar:", error);
            return interaction.editReply({
                embeds: [createErrorEmbed("❌ Error al efectuar la compra. Inténtalo nuevamente.")]
            });
        }
    }
};
