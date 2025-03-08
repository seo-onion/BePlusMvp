const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const  Items  = require("../../models/Item/Items.js");

const ITEMS_PER_PAGE = 5;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tienda")
        .setDescription("Muestra todos los artículos disponibles en la tienda."),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            // Agarra todos los elementos de la base de Datos
            const allItems = await Items.findAll({
                attributes: ["id", "name", "price", "category"],
                raw: true,
                order: [["category", "ASC"], ["price", "ASC"]]
            });

            if (allItems.length === 0) {
                return interaction.editReply("❌ No hay artículos en la tienda en este momento.");
            }

            // Se agrupa por categorias
            let groupedItems = {};
            allItems.forEach(item => {
                if (!groupedItems[item.category]) {
                    groupedItems[item.category] = [];
                }
                groupedItems[item.category].push(item);
            });

            // Convertirlos a listas paginadas
            let paginatedItems = [];
            let currentPage = 0;
            let categories = Object.keys(groupedItems);

            for (const category of categories) {
                let itemsInCategory = groupedItems[category];

                // Separar en diferentes paginas
                for (let i = 0; i < itemsInCategory.length; i += ITEMS_PER_PAGE) {
                    paginatedItems.push({
                        category,
                        items: itemsInCategory.slice(i, i + ITEMS_PER_PAGE)
                    });
                }
            }

            // Generar un embebido en Discord
            const generateEmbed = (page) => {
                const { category, items } = paginatedItems[page];

                const embed = new EmbedBuilder()
                    .setTitle("🛒 Tienda Rocky")
                    .setDescription(`Bienvenidos a la RockyStore :D.\nPuedes comprar escribiendo: \`/comprar\`\n`)
                    .setColor("#FFA501")
                    .setThumbnail("https://media.discordapp.net/attachments/1331719510243282986/1345217857117618186/WhatsApp_Image_2025-02-28_at_5.27.07_AM1.jpeg?ex=67c46802&is=67c31682&hm=fadf1c3c98223b0b981da2651a8b940bd64ca8b4fe835462260c9170d2811745&=&format=webp&width=738&height=738") // Replace with actual image
                    .setImage("https://media.discordapp.net/attachments/1331719510243282986/1345217857117618186/WhatsApp_Image_2025-02-28_at_5.27.07_AM1.jpeg?ex=67c46802&is=67c31682&hm=fadf1c3c98223b0b981da2651a8b940bd64ca8b4fe835462260c9170d2811745&=&format=webp&width=738&height=738");

                // Generar espacios esteticos
                let formattedItems = items
                    .map(item => `${item.name.padEnd(15)} ${item.price} 🪙`)
                    .join("\n");

                embed.addFields({
                    name: `📌 ${category.charAt(0).toUpperCase() + category.slice(1)}`,
                    value: `\`\`\`css\n${formattedItems}\n\`\`\``
                });

                return embed;
            };

            // Ir hacia adelante o hacia atras
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("prev_page")
                    .setLabel("⬅️ Anterior")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId("next_page")
                    .setLabel("➡️ Siguiente")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === paginatedItems.length - 1)
            );

            // Hacer el embebido
            const message = await interaction.editReply({ embeds: [generateEmbed(currentPage)], components: [row] });

            // Boton para la paginacion
            const collector = message.createMessageComponentCollector({ time: 120000 });

            collector.on("collect", async (buttonInteraction) => {
                if (buttonInteraction.user.id !== interaction.user.id) {
                    return buttonInteraction.reply({ content: "❌ No puedes usar estos botones.", ephemeral: true });
                }

                if (buttonInteraction.customId === "prev_page" && currentPage > 0) {
                    currentPage--;
                } else if (buttonInteraction.customId === "next_page" && currentPage < paginatedItems.length - 1) {
                    currentPage++;
                }

                // ✅ Update embed and buttons
                await buttonInteraction.update({
                    embeds: [generateEmbed(currentPage)],
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId("prev_page")
                                .setLabel("⬅️ Anterior")
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(currentPage === 0),
                            new ButtonBuilder()
                                .setCustomId("next_page")
                                .setLabel("➡️ Siguiente")
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(currentPage === paginatedItems.length - 1)
                        )
                    ]
                });
            });

            // Terminar despues de 120 segundos
            collector.on("end", () => {
                interaction.editReply({ components: [] }).catch(() => {});
            });

        } catch (error) {
            console.error("❌ Error al obtener los artículos:", error);
            return interaction.editReply("❌ Hubo un error al obtener los artículos.");
        }
    }
};
