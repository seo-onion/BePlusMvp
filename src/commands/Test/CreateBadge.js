const { SlashCommandBuilder } = require("discord.js");
const {createBadges} = require("../../services/item/economyService")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("creardivisas")
    .setDescription("test 3"),
  async execute(interaction) {
    
    await createBadges();
    
    return await interaction.reply({
      content: `hecho`,
      flags: 64 
    });
  },
};