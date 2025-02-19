const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require("discord.js");
const { createRocky } = require("../../services/rocky/rockyService"); // Importamos la función desde el servicio

module.exports = {
  data: new SlashCommandBuilder()
      .setName("registrarrocky")
      .setDescription("Regístrate en el sistema creando tu propio Rocky"),

  async execute(interaction) {
    try {
      const userId = interaction.user.id; // ID del usuario en Discord
      const username = interaction.user.username; // Nombre de usuario en Discord

      // Llamamos al servicio para crear un Rocky
      const result = await createRocky({ data: { id: userId, name: username } });

      if (!result.success) {
        const existingImage = new AttachmentBuilder("./src/images/rocky/rocky.png"); // Imagen para usuarios ya registrados

        return await interaction.reply({
          content: `⚠️ ${result.message}`,
          files: [existingImage], // Imagen de aviso
          ephemeral: true,
        });
      }

      // Imagen del Rocky nuevo
      const rockyImage = new AttachmentBuilder("./src/images/rocky/rocky.png");

      // Enviar la imagen directamente con `files`
      await interaction.reply({
        content: `✅ ¡Tu Rocky ha sido creado con éxito, ${username}! 🐻`,
        files: [rockyImage], // Imagen adjunta
        ephemeral: true,
      });

    } catch (error) {
      console.error("Error al registrar Rocky:", error.message);

      const errorImage = new AttachmentBuilder("./src/images/rocky/rocky.png"); // Imagen de error

      await interaction.reply({
        content: "❌ Hubo un error al registrar tu Rocky. Inténtalo más tarde.",
        files: [errorImage], // Imagen de error
        ephemeral: true,
      });
    }
  },
};
