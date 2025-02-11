const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("registrarme")
    .setDescription("Regístrate en el sistema usando tu cuenta de Discord"),
  async execute(interaction) {
    // Enlace de autenticación
    const authUrl = `http://localhost:3000/api/auth/discord`; // Cambiar a tu dominio en producción

    await interaction.reply({
      content: `Haz clic en el siguiente enlace para registrarte:\n[Registrarme](${authUrl})`,
      ephemeral: true, // Solo el usuario verá el mensaje
    });
  },
};