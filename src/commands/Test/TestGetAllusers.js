const { SlashCommandBuilder } = require("discord.js");
const {getAllUser} = require("../../services/user/userService")
const TESTER_ROLE = process.env.ADMIN;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("getusers")
    .setDescription("test 1"),
  async execute(interaction) {
    const member = interaction.member;
    // COMPROBAR QUE TIENE EL ROL DE ADMIN
    if (!member.roles.cache.has(TESTER_ROLE)) {
      console.log("No Tienes los permisos para ejecutar este comando, no eres TESTER ");
      return interaction.reply({
        content: "⛔ No tienes permisos para ejecutar este comando.",
        ephemeral: true
      });
    } else{
      console.log("Tienes los permisos para ejecutar este comando. ERES TESTER");
    }
    await getAllUser();
    console.log(new Date().toISOString().split("T")[0]) 
    return await interaction.reply({
      content: `hecho`,
      flags: 64 
    });
  },
};