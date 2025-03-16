const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require("discord.js");
const rockieService = require("../../services/rockie/rockieService");
const Users = require("../../models/User/Users");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rockie")
        .setDescription("Muestra tu Rockie. Si no tienes uno, se creará automáticamente."),

    /**
     * Executes the /rockie command: shows the user's Rockie and its stats.
     * @param {import("discord.js").ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;

        console.log(`📌 Ejecutando /rockie para el usuario: ${username} (${userId})`);

        try {
            // Retrieve or create the Rockie
            let rockie = await rockieService.getRockie(userId);
            if (!rockie) {
                console.log(`🔹 No se encontró Rockie para ${username}. Creando uno nuevo...`);
                rockie = await rockieService.createRockie(userId, username);
            } else {
                console.log(`✅ Rockie encontrado: ${rockie.name} (Nivel ${rockie.level})`);
            }

            // Render the Rockie image dynamically
            const rockieImageBuffer = await rockieService.renderRockie(userId);
            if (!rockieImageBuffer) {
                console.error("❌ No se pudo generar la imagen de Rockie.");
                return await interaction.reply({
                    content: "❌ No se pudo generar la imagen de tu Rockie.",
                    ephemeral: true
                });
            }

            // Fetch user stats (RockieCoins & RockieGems)
            const user = await Users.findByPk(userId);
            if (!user) {
                console.error("❌ No se encontró al usuario en la base de datos.");
                return await interaction.reply({
                    content: "❌ No se encontró información de tu cuenta.",
                    ephemeral: true
                });
            }

            // Build the embed with Rockie info
            const embed = new EmbedBuilder()
                .setTitle(`🐻 Tu Rockie - ${rockie.name}`)
                .setDescription(`Aquí está tu Rockie con su información actual:`)
                .addFields(
                    { name: "⭐ Nivel", value: `${rockie.level}`, inline: true },
                    { name: "💰 RockieCoins", value: `${user.rockyCoins}`, inline: true },
                    { name: "💎 RockieGems", value: `${user.rockyGems}`, inline: true }
                )
                .setColor("#3498db");

            // Attach Rockie image
            const attachment = new AttachmentBuilder(rockieImageBuffer, { name: "rockie.png" });

            // Reply with embed and image
            await interaction.reply({ embeds: [embed], files: [attachment] });

        } catch (error) {
            console.error("❌ Error ejecutando /rockie:", error);

            const errorMsg = "❌ Hubo un error al mostrar tu Rockie. Inténtalo más tarde.";
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(errorMsg);
            } else {
                await interaction.reply({ content: errorMsg, ephemeral: true });
            }
        }
    },
};

