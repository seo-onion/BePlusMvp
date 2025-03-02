const { SlashCommandBuilder } = require("discord.js");
const {getAllUser} = require("../../services/user/userService")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("getusers")
    .setDescription("test 1"),
  async execute(interaction) {
    await getAllUser();
    console.log(new Date().toISOString().split("T")[0]) 
    return await interaction.reply({
      content: `hecho`,
      flags: 64 
    });
  },
};