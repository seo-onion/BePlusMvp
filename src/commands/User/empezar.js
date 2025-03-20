const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const createAlertEmbed = require("../../utils/embed/alertEmbed");
const NO_VERIFIED = process.env.DISCORD_NOT_VERIFICATED_ROLE;
const DISCORD_URI = process.env.DISCORD_URI;

module.exports = {
  data: new SlashCommandBuilder()
      .setName("empezar")
      .setDescription("Vincula tu cuenta de Discord para generar una cuenta :D"),
  
  async execute(interaction) {
    if (!interaction.member.roles.cache.has(NO_VERIFIED)) {
      const embed = createAlertEmbed("Ya estás registrado en Be+");
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Create the welcome embed with instructions and authentication link.
    const embed = new EmbedBuilder()
      .setColor("#00AEEF")
      .setTitle("¡Bienvenido a Be Plus! 🎉")
      .setDescription(
        "Be Plus es un bot de Discord diseñado para potenciar tu productividad y fomentar hábitos saludables. 🏆\n\n" +
        "🚀 **Convierte tus hábitos en una experiencia motivadora**\n" +
        "🎯 Completa desafíos, gana recompensas y personaliza tu mascota virtual, **Rocky**. 🐾\n" +
        "📅 Gestiona tus tareas, sigue tu progreso y mantente motivado con nuestras herramientas interactivas.\n\n" +
        "🔗 **Haz clic en el siguiente enlace para autenticarte y comenzar tu aventura:**\n" +
        `[Autenticarme](${DISCORD_URI})`
      )
      .setImage("https://media.discordapp.net/attachments/1331719510243282986/1345217857117618186/WhatsApp_Image_2025-02-28_at_5.27.07_AM1.jpeg?ex=67c3bf42&is=67c26dc2&hm=92e64cdff48c0d1e8b7dc03eb1e85fcdcf73f984cd5753b5fbf8c5c38b4b86ca&=&format=webp&width=786&height=786")
      .setFooter({ text: "¡Empieza hoy y sé la mejor versión de ti mismo!" });

    // ✅ Enviar la respuesta final
    return await interaction.reply({ embeds: [embed] });
  }
};
