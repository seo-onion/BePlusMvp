const { SlashCommandBuilder } = require("discord.js");
const {deleteUser} = require("../../services/user/userService")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("eliminarme")
    .setDescription("test 2"),
  async execute(interaction) {
    const userId = interaction.user.id;
    await deleteUser(userId);
    
    return await interaction.reply({
      content: `hecho`,
      flags: 64 
    });
  },
};