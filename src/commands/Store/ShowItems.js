const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const { Items } = require("../../models/Item/Items.js");
const createErrorEmbed = require("../../utils/errorEmbed");


const ITEMS_PER_PAGE = 5; // 🛍️ Define la cantidad de artículos por página

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tienda")
        .setDescription("Muestra todos los artículos disponibles en la tienda Rocky."),

    restricted: true, // ✅ Se restringe el comando para que solo Beta Testers lo usen

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true }); // 🔄 Deferimos la respuesta para evitar errores con editReply()

        try {
            // 📌 Obtener todos los artículos desde la base de datos
            const allItems = await Items.findAll({
                attributes: ["id", "name", "price", "category"],
                raw: true,
                order: [["category", "ASC"], ["price", "ASC"]],
            });

            // 🚨 Si no hay artículos disponibles, mostrar mensaje de error
            if (allItems.length === 0) {
                return interaction.editReply("❌ No hay artículos en la tienda en este momento.");
            }

            // 🏷️ Agrupar artículos por categoría
            let groupedItems = {};
            allItems.forEach(item => {
                if (!groupedItems[item.category]) {
                    groupedItems[item.category] = [];
                }
                groupedItems[item.category].push(item);
            });

            // 📜 Crear lista paginada de artículos
            let paginatedItems = [];
            let currentPage = 0;
            let categories = Object.keys(groupedItems);

            for (const category of categories) {
                let itemsInCategory = groupedItems[category];

                // 📌 Separar los artículos en diferentes páginas
                for (let i = 0; i < itemsInCategory.length; i += ITEMS_PER_PAGE) {
                    paginatedItems.push({
                        category,
                        items: itemsInCategory.slice(i, i + ITEMS_PER_PAGE),
                    });
                }
            }

            // 🖼️ Generar el embed con los artículos de la tienda
            const generateEmbed = (page) => {
                const { category, items } = paginatedItems[page];

                const embed = new EmbedBuilder()
                    .setTitle("🛒 Tienda Rocky")
                    .setDescription("Bienvenido a la **RockyStore** 🏪\nPuedes comprar usando: `/comprar`\n")
                    .setColor("#FFA501") // 🎨 Color naranja llamativo
                    .setThumbnail("https://media.discordapp.net/attachments/1331719510243282986/1345217857117618186/WhatsApp_Image_2025-02-28_at_5.27.07_AM1.jpeg") // 📸 Imagen de la tienda
                    .setImage("https://media.discordapp.net/attachments/1331719510243282986/1345217857117618186/WhatsApp_Image_2025-02-28_at_5.27.07_AM1.jpeg");

                // 📌 Formatear los artículos en una lista legible
                let formattedItems = items.map(item => `${item.name.padEnd(15)} ${item.price} 🪙`).join("\n");

                embed.addFields({
                    name: `📌 ${category.charAt(0).toUpperCase() + category.slice(1)}`,
                    value: `\`\`\`css\n${formattedItems}\n\`\`\``,
                });

                return embed;
            };

            // 🎛️ Crear los botones de navegación para paginar
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

            // 📨 Enviar la tienda con la primera página de artículos
            const message = await interaction.editReply({
                embeds: [generateEmbed(currentPage)],
                components: [generateButtons(currentPage)],
            });

            // 🎮 Configurar el recolector de botones para paginación
            const collector = message.createMessageComponentCollector({ time: 120000 });

            collector.on("collect", async (buttonInteraction) => {
                if (buttonInteraction.user.id !== interaction.user.id) {
                    return buttonInteraction.reply({ content: "❌ No puedes usar estos botones.", ephemeral: true });
                }

                // 🔄 Cambiar de página según el botón presionado
                if (buttonInteraction.customId === "prev_page" && currentPage > 0) {
                    currentPage--;
                } else if (buttonInteraction.customId === "next_page" && currentPage < paginatedItems.length - 1) {
                    currentPage++;
                }

                // ✅ Actualizar el embed y los botones de paginación
                await buttonInteraction.update({
                    embeds: [generateEmbed(currentPage)],
                    components: [generateButtons(currentPage)],
                });
            });

            // ⏳ Desactivar los botones después de 120 segundos
            collector.on("end", () => {
                interaction.editReply({ components: [] }).catch(() => {});
            });

        } catch (error) {
            console.error("❌ Error al obtener los artículos de la tienda:", error);
            return interaction.editReply({ embeds: [createErrorEmbed("❌ Hubo un error al obtener los artículos. Intenta más tarde.")] });
        }
    },
};
