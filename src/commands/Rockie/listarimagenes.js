// 📌 src/commands/Rockie/listarimagenes.js
const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");
const s3Service = require("../../services/aws/s3Service");

// 📂 Valid folders in the S3 bucket
const VALID_FOLDERS = ["bases/", "sombreros/", "ropas/", "ojos/", "bocas/"];
const ITEMS_PER_PAGE = 5;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("listarimagenes")
        .setDescription("Lista las imágenes almacenadas en el bucket de Rockie.")
        .addStringOption(option =>
            option.setName("carpeta")
                .setDescription("Selecciona una carpeta específica o muestra todas.")
                .setRequired(false)
                .addChoices(
                    { name: "Todas", value: "todas" },
                    { name: "Bases", value: "bases/" },
                    { name: "Sombreros", value: "sombreros/" },
                    { name: "Ropas", value: "ropas/" },
                    { name: "Ojos", value: "ojos/" },
                    { name: "Bocas", value: "bocas/" }
                )
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const selectedFolder = interaction.options.getString("carpeta") || "todas";
        const foldersToList = selectedFolder === "todas" ? VALID_FOLDERS : [selectedFolder];

        let allImages = [];

        for (const folder of foldersToList) {
            const files = await s3Service.listFilesInS3(folder);
            const urls = files.map(file => ({
                name: file,
                url: s3Service.getFileUrl(file, folder),
                folder
            }));
            allImages.push(...urls);
        }

        if (allImages.length === 0) {
            return interaction.editReply("❌ No se encontraron imágenes en el bucket para la carpeta especificada.");
        }

        let currentPage = 0;
        const totalPages = Math.ceil(allImages.length / ITEMS_PER_PAGE);

        const generateEmbed = (page) => {
            const start = page * ITEMS_PER_PAGE;
            const imagesToShow = allImages.slice(start, start + ITEMS_PER_PAGE);

            const embed = new EmbedBuilder()
                .setTitle("🖼️ Imágenes en el Bucket")
                .setDescription(`Carpeta: **${selectedFolder === "todas" ? "Todas" : selectedFolder}**`)
                .setFooter({ text: `Página ${page + 1} de ${totalPages}` })
                .setColor("#00BFFF");

            imagesToShow.forEach(img => {
                embed.addFields({
                    name: `📂 ${img.folder} - ${img.name}`,
                    value: `[Ver Imagen](${img.url})`,
                    inline: false
                });
            });

            embed.setImage(imagesToShow[0].url);

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
                    .setDisabled(page === totalPages - 1)
            );
        };

        const message = await interaction.editReply({
            embeds: [generateEmbed(currentPage)],
            components: [generateButtons(currentPage)]
        });

        const collector = message.createMessageComponentCollector({ time: 120000 });

        collector.on("collect", async (btnInt) => {
            if (btnInt.user.id !== interaction.user.id) {
                return btnInt.reply({ content: "❌ No puedes usar estos botones.", ephemeral: true });
            }

            if (btnInt.customId === "prev_page" && currentPage > 0) {
                currentPage--;
            } else if (btnInt.customId === "next_page" && currentPage < totalPages - 1) {
                currentPage++;
            }

            await btnInt.update({
                embeds: [generateEmbed(currentPage)],
                components: [generateButtons(currentPage)]
            });
        });

        collector.on("end", () => {
            message.edit({ components: [] }).catch(() => {});
        });
    }
};

