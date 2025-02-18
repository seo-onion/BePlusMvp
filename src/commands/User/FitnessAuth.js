const { SlashCommandBuilder } = require("discord.js");

const ROLE_ID = process.env.TESTER_ROLE;
const URL = process.env.GOOGLE_URI

module.exports = {
    data: new SlashCommandBuilder()
        .setName("vincularmeconfit")
        .setDescription("Vincula tu cuenta de Discord con la aplicacion de google fit"),

    async execute(interaction) {
        member = interaction.member;

        if (!member.roles.cache.has(ROLE_ID)) {
            return interaction.reply({ content: '⛔ tu cuenta ya está vinculada :D.', ephemeral: true });
        }

        await interaction.reply({
            content: `Haz clic en el siguiente enlace para vincular tu cuenta con Google Fit:\n[autenticarme](${URL})`,
            ephemeral: true,
        });
    },
};