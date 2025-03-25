const { SlashCommandBuilder } = require("discord.js");
const { deleteUser } = require("../../services/user/userService");
const TESTER_ROLE = process.env.TESTER_ROLE;

module.exports = {
  data: new SlashCommandBuilder()
      .setName("eliminarme")
      .setDescription("Elimina tu usuario del sistema."),

  async execute(interaction) {
    const member = interaction.member;

    if (!member.roles.cache.has(TESTER_ROLE)) {
      console.log("You don't have permission to execute this command, you are not a TESTER.");
      return interaction.reply({
        content: "⛔ No tienes permisos para ejecutar este comando.",
        ephemeral: true
      });
    } else {
      console.log("You have permission to execute this command. You are a TESTER.");
    }
    const userId = interaction.user.id;

    try {
      // User deletion: Attempts to delete the user from the system.
      await deleteUser(userId);
      console.log("✅ User deleted successfully.");

      // Success response: Notifies the user of the successful deletion.
      return await interaction.reply({
        content: `✅ Tu usuario ha sido eliminado correctamente.`,
        ephemeral: true
      });
    } catch (error) {
      // Error logging: Logs any error encountered during the deletion process.
      console.error("❌ Error while deleting user:", error);

      // Error response: Provides feedback to the user about the error.
      return await interaction.reply({
        content: "❌ Ocurrió un error al intentar eliminar tu usuario.",
        ephemeral: true
      });
    }
  },
};
