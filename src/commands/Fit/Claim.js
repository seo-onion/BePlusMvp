const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const GoogleFitService = require("../../services/google/fitService");
const UserService = require("../../services/user/userService")
const createAlertEmbed = require("../../utils/embed/alertEmbed");
const createErrorEmbed = require("../../utils/embed/errorEmbed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reclamar")
        .setDescription("Convierte tus pasos en RockyCoins"),


    restricted: true,

    async execute(interaction) 

    {
        try {
            await interaction.deferReply() //  Prevent command timeout while processing the response
            
            const userId = interaction.user.id;

            const user = await UserService.getUser(userId)
            const userAuth = user.toJSON();
            //console.log(userAuth)
            // Verify if user sign in with google fit
            if (!userAuth.Auth.googleToken || !userAuth.Auth.googleRefreshToken) {
                const errorEmbed = createErrorEmbed(title = "Aún no estas vinculado con google fit", description = "Utiliza el comando /vincularconfit para iniciar");
                return await interaction.editReply({ embeds: [errorEmbed], ephemeral: true});
            }
            
            // Attempts to claim RockyCoins for the userID.
            const claim = await GoogleFitService.claimRockyCoins(userId);

            // If the user has already claimed their reward for the day, send an alert message.
            if (!claim) {
                const alertEmbed = createAlertEmbed("⏳ Ya has reclamado la recompensa de hoy. Vuelve mañana para más RockyCoins. 🏃‍♂️💰");
                return await interaction.editReply({ embeds: [alertEmbed], ephemeral: true});
            }

            console.log(`User with id: "${userId}" claimed ${claim} RockyCoins.`);

            // Constructs the success embed with details of the reward and send it
            const embed = new EmbedBuilder()
                .setColor("#FFD700")
                .setTitle("🎉 ¡RockyCoins Reclamadas!")
                .setDescription("Has convertido tus pasos en **RockyCoins** exitosamente. 🏆")
                .addFields({ name: "💰 RockyCoins obtenidas", value: `**${claim}** 🪙`, inline: true })
                .setFooter({ text: "¡Sigue caminando y gana más recompensas!" })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("Error to claim rockyCoins", error);
            const errorEmbed = createErrorEmbed("Ocurrió un error inesperado al reclamar tus RockyCoins.");

            // Ensures that a reply is only sent if one hasn't been already
            if (interaction.replied || interaction.deferred) {
                return await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};