
const { SlashCommandBuilder } = require("discord.js");
const {createBadges} = require("../../services/item/economyService")
const TESTER_ROLE = process.env.TESTER_ROLE;


module.exports = {
  data: new SlashCommandBuilder()
    .setName("creardivisas")
    .setDescription("Crea las divisas en el sistema de economía.")
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

    await createBadges();

    return await interaction.reply({
      content: `hecho`,
      flags: 64 
    });
  },
};
