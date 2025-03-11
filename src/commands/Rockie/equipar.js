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

        const result = await equipAccessory(userId, itemName);
        await interaction.reply(result.message);
    },
};

