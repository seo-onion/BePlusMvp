const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { getAllUser } = require("../../services/user/userService");
const TESTER_ROLE = process.env.TESTER_ROLE;

module.exports = {
  data: new SlashCommandBuilder()
      .setName("getusers")
      .setDescription("Obtiene todos los usuarios del sistema.")
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const member = interaction.member;

    // Role validation: Checks if the user has the required TESTER role to execute the command.
    if (!member.roles.cache.has(TESTER_ROLE)) {
      console.log("You don't have permission to execute this command, you are not a TESTER.");
      return interaction.reply({
        content: "⛔ No tienes permisos para ejecutar este comando.",
        ephemeral: true
      });
    } else {
      console.log("You have permission to execute this command. You are a TESTER.");
    }

    // Fetch all users: Calls the service to retrieve all users from the system.
    await getAllUser();
    console.log(new Date().toISOString().split("T")[0]);

    // Success response: Confirms the completion of the action to the user.
    return await interaction.reply({
      content: `hecho`,
      flags: 64
    });
  },
};
