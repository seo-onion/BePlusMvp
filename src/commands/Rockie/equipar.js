// 📌 src/commands/Rockie/equipar.js
const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const accessoryService = require("../../services/rockie/accessoryService");
const renderRockieService = require("../../services/rockie/renderRockieService");
const { Items } = require("../../models/Item/Items.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("equipar")
        .setDescription("Equipa un accesorio en tu Rockie.")
        .addStringOption(option =>
            option.setName("item")
                .setDescription("Nombre del accesorio que deseas equipar.")
                .setRequired(true)
        ),

    /**
     * Executes the command to equip an accessory on Rockie.
     * @param {ChatInputCommandInteraction} interaction - The interaction object.
     */
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.user.id;
        const itemName = interaction.options.getString("item");

        try {
            const result = await accessoryService.equipAccessory(userId, itemName);

            if (!result.success) {
                return await interaction.editReply(result.message);
            }

            const rockieImageBuffer = await renderRockieService.renderRockie(userId);
            if (!rockieImageBuffer) {
                return await interaction.editReply("❌ Error al generar la imagen de Rockie.");
            }

            const attachment = new AttachmentBuilder(rockieImageBuffer, { name: "rockie.png" });

            const embed = new EmbedBuilder()
                .setTitle("🎽 Accesorio Equipado")
                .setDescription(result.message)
                .setColor("#00FF00")
                .setImage("attachment://rockie.png")
                .setFooter({ text: "Rockie actualizado" });

            return await interaction.editReply({ embeds: [embed], files: [attachment] });

        } catch (error) {
            console.error("❌ Error ejecutando el comando /equipar:", error);
            return await interaction.editReply("❌ Hubo un error al equipar el accesorio. Intenta más tarde.");
        }
    },
};

