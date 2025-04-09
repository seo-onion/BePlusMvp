// 📌 src/commands/Rockie/equipar.js
const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const accessoryService = require("../../services/rockie/accessoryService");
const renderRockieService = require("../../services/rockie/renderRockieService");
const createErrorEmbed = require("../../utils/embed/errorEmbed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("equipar")
        .setDescription("Equipa un accesorio en tu Rockie.")
        .addStringOption(option =>
            option.setName("item")
                .setDescription("Nombre del accesorio que deseas equipar.")
                .setRequired(true)
        ),
        restricted: true, // Restricts this command for specific users (like Beta Testers).
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
                const errorEmbed = createErrorEmbed({
                    title: "❌ ¡Oops! Tuvimos un error al vestir a Rocky",
                    description: "Parece que algo salió mal al intentar vestir a Rocky. 😔\n\nPor favor, contacta con un administrador o intenta nuevamente más tarde. 💬"
                });
                console.log(result.message)
                return await interaction.editReply({embeds: [errorEmbed], ephemeral: true});
            }

            const rockieImageBuffer = await renderRockieService.renderRockie(userId);
            if (!rockieImageBuffer) {
                const errorEmbed = createErrorEmbed({
                    title: "❌ ¡Oops! No pudimos generar la imagen de Rocky",
                    description: "Parece que algo salió mal al intentar vestir a Rocky. 😔\n\nPor favor, contacta con un administrador o intenta nuevamente más tarde. 💬"
                });
            
                return await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            }

            const attachment = new AttachmentBuilder(rockieImageBuffer, { name: "rockie.png" });

            const embed = new EmbedBuilder()
                .setTitle("🎽 Accesorio Equipado")
                .setDescription(result.message)
                .setColor("#00FF00")
                .setImage("attachment://rockie.png")
                .setFooter({ text: "Rockie actualizado" });

            return await interaction.editReply({ embeds: [embed], files: [attachment], ephemeral: true });

        } catch (error) {
            console.error("Error ejecutando el comando /equipar:", error);
            const errorEmbed = createErrorEmbed();
            return await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};

