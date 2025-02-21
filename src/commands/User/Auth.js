const { SlashCommandBuilder } = require("discord.js");

const ROLE_ID = process.env.NOT_VERIFICATED_ROLE;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("autenticarme")
    .setDescription("Vincula tu cuenta de Discord para generar una cuenta :D"),
  async execute(interaction) {
    // Enlace de autenticación
    const authUrl = `http://localhost:3000/api/auth/discord`; 

    member = interaction.member;
    
    if (!member.roles.cache.has(ROLE_ID)) {
      return interaction.reply({ content: '⛔ Ya estas registrado en Be+ :D.', ephemeral: true });
  }
    await interaction.reply({
      content: `Haz clic en el siguiente enlace para autenticarte:\n[autenticarme](${authUrl})`,
      ephemeral: true,  
    });
  },
};