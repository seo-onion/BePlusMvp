const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rocky")
    .setDescription("Muestra tu Rocky."),
  async execute(interaction) {
    await interaction.reply("¡Aquí está tu Rocky!");
  },
};
