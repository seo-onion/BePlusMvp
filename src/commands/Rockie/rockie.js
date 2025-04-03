const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require("discord.js");
const rockieService = require("../../services/rockie/rockieService");
const UserServices = require("../../services/user/userService")
const createErrorEmbed = require("../../utils/embed/errorEmbed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rockie")
        .setDescription("Muestra tu Rockie. Si no tienes uno, se creará automáticamente."),

    /**
     * Ejecuta el comando /rockie.
     * @param {import("discord.js").ChatInputCommandInteraction} interaction
     */
    restricted: true, // Restricts this command for specific users (like Beta Testers).
    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;

        try {
            await interaction.deferReply({ ephemeral: true });

            // Get user
            const user = await UserServices.getUser(userId);

            // Checks if the user exists in the database.
            if (!user) {
                console.error("user not found");
                const errorEmbed = createErrorEmbed({
                    title: "Usuario no encontrado",
                    description: "No se logró recuperar tu información. Intenta actualizarlo."
                });
                return await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            }

            // find or create a rocky
            let rockie = await rockieService.getRockie(userId);
            if (!rockie) {
                console.log(`No Rockie found for ${username}. Creating a new one...`);
                rockie = await rockieService.createRockie(userId, username);
            }

            // Render Rockie image (with URL logging)
            const rockieImageBuffer = await rockieService.renderRockie(userId, {
                debug: true // to print url's 
            });

            if (!rockieImageBuffer) {
                console.error("Rockie image could not be generated.");
                const errorEmbed = createErrorEmbed({
                    title: "Error al renderizar a tu rockie",
                    description: "No se pudo generar la imagen de tu Rockie"
                });
                return await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            }

            // Creates an embed message with the Rockie's details.
            const embed = new EmbedBuilder()
                .setTitle(`🪨 Tu Rockie - ${rockie.name}`)
                .setDescription(`Aquí está tu Rockie con su información actual:`)
                .addFields(
                    { name: "⭐ Nivel", value: `${rockie.level}`, inline: true },
                    { name: "💰 RockieCoins", value: `${user.rockyCoins}`, inline: true },
                    { name: "💎 RockieGems", value: `${user.rockyGems}`, inline: true }
                )
                .setColor("#3498db");

            // Attaches the Rockie image to the embed message.
            const attachment = new AttachmentBuilder(rockieImageBuffer, { name: "rockie.png" });

            await interaction.editReply({ embeds: [embed], files: [attachment] });

        } catch (error) {
            console.error("Error executing /rockie: ", error);

            const errorEmbed = createErrorEmbed({
                title: "Error ejecutando /rockie:",
                description: "Hubo un error al mostrar tu Rockie. Inténtalo más tarde."
            });

            return await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
