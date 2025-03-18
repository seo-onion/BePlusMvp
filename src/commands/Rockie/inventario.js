// 📌 src/commands/Rockie/inventario.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require("discord.js");
const accessoryService = require("../../services/rockie/accessoryService");
const { renderRockie } = require("../../services/rockie/renderRockieService");

const ITEMS_PER_PAGE = 5;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("inventario")
        .setDescription("Muestra tu inventario de accesorios y permite ver a Rockie."),

    async execute(interaction) {
        const userId = interaction.user.id;
        await interaction.deferReply({ ephemeral: true });

        try {
            const userItems = await accessoryService.getUserItemsWithDetails(userId);

            if (!userItems.length) {
                return interaction.editReply("❌ No tienes accesorios en tu inventario.");
            }

            // Pagination setup
            let currentPage = 0;
            const totalPages = Math.ceil(userItems.length / ITEMS_PER_PAGE);

            const generateEmbed = async (page) => {
                const start = page * ITEMS_PER_PAGE;
                const end = start + ITEMS_PER_PAGE;
                const itemsOnPage = userItems.slice(start, end);

                const embed = new EmbedBuilder()
                    .setTitle("🎒 Inventario de Accesorios")
                    .setColor("#8E44AD")
                    .setDescription("Estos son los accesorios que has comprado.")
                    .setFooter({ text: `Página ${page + 1} de ${totalPages}` })
                    .setTimestamp();

                for (const item of itemsOnPage) {
                    embed.addFields({
                        name: `🛍️ ${item.name}`,
                        value: `Categoría: **${item.category}**\nPrecio: ${item.price} 🪙`,
                        inline: false
                    });
                }

                return embed;
            };

            const generateButtons = () => {
                return new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("prev_page")
                        .setLabel("⬅️ Anterior")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId("next_page")
                        .setLabel("➡️ Siguiente")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === totalPages - 1),
                    new ButtonBuilder()
                        .setCustomId("view_rockie")
                        .setLabel("🧸 Ver Rockie")
                        .setStyle(ButtonStyle.Secondary)
                );
            };

            const message = await interaction.editReply({
                embeds: [await generateEmbed(currentPage)],
                components: [generateButtons()]
            });

            const collector = message.createMessageComponentCollector({ time: 120000 });

            collector.on("collect", async (btnInteraction) => {
                if (btnInteraction.user.id !== interaction.user.id) {
                    return await btnInteraction.reply({ content: "❌ No puedes usar estos botones.", ephemeral: true });
                }

                if (btnInteraction.customId === "prev_page") {
                    currentPage--;
                    await btnInteraction.update({
                        embeds: [await generateEmbed(currentPage)],
                        components: [generateButtons()]
                    });
                }

                if (btnInteraction.customId === "next_page") {
                    currentPage++;
                    await btnInteraction.update({
                        embeds: [await generateEmbed(currentPage)],
                        components: [generateButtons()]
                    });
                }

                if (btnInteraction.customId === "view_rockie") {
                    const buffer = await renderRockie(userId);
                    const attachment = new AttachmentBuilder(buffer, { name: "rockie.png" });

                    await btnInteraction.reply({
                        content: "Aquí está tu Rockie con los accesorios actuales:",
                        files: [attachment],
                        ephemeral: true
                    });
                }
            });

            collector.on("end", async () => {
                await interaction.editReply({ components: [] }).catch(() => {});
            });

        } catch (error) {
            console.error("❌ Error al obtener el inventario:", error);
            await interaction.editReply("❌ Hubo un error al cargar tu inventario. Inténtalo de nuevo.");
        }
    }
};

