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
            // ✅ Deferimos la interacción para evitar errores de tiempo de espera
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ ephemeral: true });
            }

            const result = await equipAccessory(userId, itemName);

            // ✅ Enviamos la respuesta final
            return await interaction.editReply(result.message);

        } catch (error) {
            console.error("❌ Error al equipar accesorio:", error);

            const errorMessage = "❌ Hubo un error al intentar equipar el accesorio.";

            if (interaction.deferred || interaction.replied) {
                return await interaction.editReply(errorMessage);
            } else {
                return await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    },
};
