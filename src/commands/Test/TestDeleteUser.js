
const { SlashCommandBuilder } = require("discord.js");
const {deleteUser} = require("../../services/user/userService")
const TESTER_ROLE = process.env.TESTER_ROLE;


module.exports = {
  data: new SlashCommandBuilder()
    .setName("eliminarme")
    .setDescription("Elimina tu usuario del sistema.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

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

    try {
      await deleteUser(userId);
      return await interaction.reply({
        content: `✅ Tu usuario ha sido eliminado correctamente.`,
        ephemeral: true
      });
    } catch (error) {
      console.error("❌ Error al eliminar usuario:", error);
      return await interaction.reply({
        content: "❌ Ocurrió un error al intentar eliminar tu usuario.",
        ephemeral: true
      });
    }
  },
};
