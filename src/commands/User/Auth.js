const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const ROLE_ID = process.env.NOT_VERIFICATED_ROLE;
const DISCORD_URI = process.env.DISCORD_URI;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("empezar")
    .setDescription("Vincula tu cuenta de Discord para generar una cuenta :D"),
  async execute(interaction) {

    const member = interaction.member;
/*
    if (!member.roles.cache.has(ROLE_ID)) {
      return interaction.reply({ 
        content: '⛔ Ya estás registrado en Be+ :D.', 
        ephemeral: true 
      });
    }
*/
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
      .setImage("https://imgur.com/tHu78tP")
      .setFooter({ text: "¡Empieza hoy y sé la mejor versión de ti mismo!" });

    return await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
