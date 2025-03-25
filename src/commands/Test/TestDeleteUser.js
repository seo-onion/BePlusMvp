const { SlashCommandBuilder } = require("discord.js");
const { deleteUser } = require("../../services/user/userService");
const verification = require("../../utils/verification");
const TESTER_ROLE = process.env.TESTER_ROLE;

module.exports = {
  data: new SlashCommandBuilder()
      .setName("eliminarme")
      .setDescription("Elimina tu usuario del sistema."),

  async execute(interaction) {
    const member = interaction.member;

    // Role validation: Checks if the user has the required TESTER role to execute the command.
    if (await verification(member, TESTER_ROLE, "⛔ No tienes permisos para ejecutar este comando.", interaction, rol, createAlertEmbed, createErrorEmbed)){
      return; // Stops execution if verification fails
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
