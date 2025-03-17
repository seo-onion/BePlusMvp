const { SlashCommandBuilder } = require("discord.js");
const { equipAccessory } = require("../../services/rockie/accessoryService");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("equipar")
        .setDescription("Equipa un accesorio en tu Rockie.")
        .addStringOption(option =>
            option.setName("nombre")
                .setDescription("Nombre del accesorio")
                .setRequired(true)
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        const itemName = interaction.options.getString("nombre");

        try {
            // Defers the interaction to prevent timeout issues during processing.
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ ephemeral: true });
            }

            // Attempts to equip the accessory and retrieves the result message.
            const result = await equipAccessory(userId, itemName);

            // Sends the final response to the user.
            return await interaction.editReply(result.message);

        } catch (error) {
            console.error("❌ Error al equipar accesorio:", error);

            const errorMessage = "❌ Hubo un error al intentar equipar el accesorio.";

            // Sends the final response to the user.
            if (interaction.deferred || interaction.replied) {
                return await interaction.editReply(errorMessage);
            } else {
                return await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    },
};
