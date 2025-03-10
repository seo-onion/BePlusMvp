const { SlashCommandBuilder } = require("discord.js");
const {deleteUser} = require("../../services/user/userService")
const TESTER_ROLE = process.env.ADMIN;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("eliminarme")
    .setDescription("test 2"),
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
    const userId = interaction.user.id;
    await deleteUser(userId);
    
    return await interaction.reply({
      content: `hecho`,
      flags: 64 
    });
  },
};