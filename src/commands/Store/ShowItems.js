const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Op } = require("sequelize");
const Items = require("../../models/Item/Items.js");
const createErrorEmbed = require("../../utils/embed/errorEmbed");

const ITEMS_PER_PAGE = 5; // Maximum number of items to show per page.

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tienda")
        .setDescription("Muestra todos los artículos disponibles en la tienda Rocky."),

    restricted: true, // Restricts the command to specific users or conditions.

    async execute(interaction) {
        try {
            const allItems = await Items.findAll({
                where: {
                    category: {
                        [Op.ne]: 'badge' // Excludes items categorized as 'badge'.
                    }
                },
                attributes: ["id", "name", "price", "category"],
                raw: true,
                order: [["category", "ASC"], ["price", "ASC"]], // Sorts items by category and price.
            });

            // Sends an alert if no items are found in the store.
            if (allItems.length === 0) {
                return await interaction.editReply("❌ No hay artículos en la tienda en este momento.");
            }

            // Groups items by category.
            let groupedItems = {};
            allItems.forEach(item => {
                if (!groupedItems[item.category]) {
                    groupedItems[item.category] = [];
                }
                groupedItems[item.category].push(item);
            });

            // Splits items into paginated groups based on ITEMS_PER_PAGE .
            let paginatedItems = [];
            let currentPage = 0;
            let categories = Object.keys(groupedItems);

            for (const category of categories) {
                let itemsInCategory = groupedItems[category];
                for (let i = 0; i < itemsInCategory.length; i += ITEMS_PER_PAGE) {
                    paginatedItems.push({
                        category,
                        items: itemsInCategory.slice(i, i + ITEMS_PER_PAGE),
                    });
                }
            }
            // Generates an embed for the current page.
            const generateEmbed = (page) => {
                const { category, items } = paginatedItems[page];
                const embed = new EmbedBuilder()
                    .setTitle("🛒 Tienda Rocky")
                    .setDescription("Bienvenido a la **RockyStore** 🏪\nPuedes comprar usando: `/comprar`\n")
                    .setColor("#FFA501")
                    .setThumbnail("https://media.discordapp.net/attachments/1331719510243282986/1345217857117618186/WhatsApp_Image_2025-02-28_at_5.27.07_AM1.jpeg")
                    .setImage("https://media.discordapp.net/attachments/1331719510243282986/1345217857117618186/WhatsApp_Image_2025-02-28_at_5.27.07_AM1.jpeg");

                let formattedItems = items.map(item => `${item.name.padEnd(15)} ${item.price} 🪙`).join("\n");

                embed.addFields({
                    name: `📌 ${category.charAt(0).toUpperCase() + category.slice(1)}`,
                    value: `\`\`\`css\n${formattedItems}\n\`\`\``,
                });

                return embed;
            };

            // Generates navigation buttons for pagination ( ← or → )
            const generateButtons = (page) => {
                return new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("prev_page")
                        .setLabel("⬅️ Anterior")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId("next_page")
                        .setLabel("➡️ Siguiente")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === paginatedItems.length - 1)
                );
            };

            // Sends the initial paginated store message.
            const message = await interaction.editReply({
                embeds: [generateEmbed(currentPage)],
                components: [generateButtons(currentPage)],
            });

            // Collects button interactions for pagination.
            const collector = message.createMessageComponentCollector({ time: 120000 });

            collector.on("collect", async (buttonInteraction) => {
                if (buttonInteraction.user.id !== interaction.user.id) {
                    return await buttonInteraction.reply({ content: "❌ No puedes usar estos botones.", ephemeral: true });
                }

                // Handles pagination button logic.
                if (buttonInteraction.customId === "prev_page" && currentPage > 0) {
                    currentPage--;
                } else if (buttonInteraction.customId === "next_page" && currentPage < paginatedItems.length - 1) {
                    currentPage++;
                }

                await buttonInteraction.update({
                    embeds: [generateEmbed(currentPage)],
                    components: [generateButtons(currentPage)],
                });
            });

            // Disables buttons after the collector ends.
            collector.on("end", () => {
                interaction.editReply({ components: [] }).catch(() => {});
            });

        } catch (error) {
            console.error("❌ Error al obtener los artículos de la tienda:", error);

            const errorEmbed = createErrorEmbed("❌ Hubo un error al obtener los artículos. Intenta más tarde.");

            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};
