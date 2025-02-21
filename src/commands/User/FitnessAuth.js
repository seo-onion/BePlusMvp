const { SlashCommandBuilder } = require("discord.js");

const ROLE_ID = process.env.TESTER_ROLE;
const URL = process.env.GOOGLE_URI

module.exports = {
    data: new SlashCommandBuilder()
        .setName("vincularmeconfit")
        .setDescription("Vincula tu cuenta de Discord con la aplicacion de google fit"),

    async execute(interaction) {
        const Id = interaction.user.id; // Obtiene el ID del usuario de Discord

        // Generar la URL de autenticación con el ID del usuario como parámetro de estado
        const authUrl = `http://localhost:3000/api/auth/google?id=${Id}`;

        await interaction.reply(`🔗 Haz clic en el siguiente enlace para vincular Google Fit: [Conectar Google Fit](${authUrl})`);
    },
};