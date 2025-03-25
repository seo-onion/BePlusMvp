const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Op } = require("sequelize");
const Items = require("../../models/Item/Items.js");
const createErrorEmbed = require("../../utils/embed/errorEmbed");
const ListObjectFormat = require("../../utils/ListObjects");

const ITEMS_PER_PAGE = 5;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tienda")
        .setDescription("Muestra todos los artículos disponibles en la tienda Rocky."),

    restricted: true,

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const allItems = await Items.findAll({
                where: {
                    category: {
                        [Op.ne]: 'badge'
                    }
                },
                attributes: ["id", "name", "price", "category"],
                raw: true,
                order: [["category", "ASC"], ["price", "ASC"]],
            });

            if (allItems.length === 0) {
                return await interaction.editReply("❌ No hay artículos en la tienda actualmente.");
            }

            let groupedItems = {};
            allItems.forEach(item => {
                if (!groupedItems[item.category]) groupedItems[item.category] = [];
                groupedItems[item.category].push(item);
            });

            let paginatedItems = [];
            let categories = Object.keys(groupedItems);

            for (const category of categories) {
                const itemsInCategory = groupedItems[category];
                for (let i = 0; i < itemsInCategory.length; i += ITEMS_PER_PAGE) {
                    paginatedItems.push({
                        category,
                        items: itemsInCategory.slice(i, i + ITEMS_PER_PAGE),
                    });
                }
            }

            let currentPage = 0;

            const generateEmbed = (page) => {
                const { category, items } = paginatedItems[page];
                const embed = new EmbedBuilder()
                    .setTitle("🛒 Tienda Rocky")
                    .setDescription("Bienvenido a la **RockyStore** 🏪\nPuedes comprar usando: `/comprar`")
                    .setColor("#FFA501");

                embed.addFields({
                    name: `📌 ${category.charAt(0).toUpperCase() + category.slice(1)}`,
                    value: ListObjectFormat(items, "❌ No hay items en la tienda"),
                });

                return embed;
            };

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

            const message = await interaction.editReply({
                embeds: [generateEmbed(currentPage)],
                components: [generateButtons(currentPage)],
            });

            const collector = message.createMessageComponentCollector({ time: 120000 });

            collector.on("collect", async (btn) => {
                if (btn.user.id !== interaction.user.id) {
                    return await btn.reply({ content: "❌ No puedes usar estos botones.", ephemeral: true });
                }

                if (btn.customId === "prev_page" && currentPage > 0) {
                    currentPage--;
                } else if (btn.customId === "next_page" && currentPage < paginatedItems.length - 1) {
                    currentPage++;
                }

                await btn.update({
                    embeds: [generateEmbed(currentPage)],
                    components: [generateButtons(currentPage)],
                });
            });

            collector.on("end", () => {
                interaction.editReply({ components: [] }).catch(() => {});
            });

        } catch (error) {
            console.error("❌ Error al obtener los artículos de la tienda:", error);

            const errorEmbed = createErrorEmbed({
                title: "❌ Hubo un error al obtener los artículos. Intenta más tarde.",
            });

            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};
