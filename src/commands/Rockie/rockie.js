const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require("discord.js");
const rockieService = require("../../services/rockie/rockieService");
const UserServices = require("../../services/user/userService")

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

        console.log(`📌 Ejecutando /rockie para el usuario: ${username} (${userId})`);

        try {
            // ✅ Defiere la respuesta para evitar timeouts
            await interaction.deferReply({ ephemeral: true });

            // Buscar o crear Rockie
            let rockie = await rockieService.getRockie(userId);
            if (!rockie) {
                console.log(`🔹 No se encontró Rockie para ${username}. Creando uno nuevo...`);
                rockie = await rockieService.createRockie(userId, username);
            } else {
                console.log(`✅ Rockie encontrado: ${rockie.name} (Nivel ${rockie.level})`);
            }

            // Renderizar imagen de Rockie (con logging de URLs)
            const rockieImageBuffer = await rockieService.renderRockie(userId, {
                debug: true // 🚨 Para imprimir URLs
            });

            if (!rockieImageBuffer) {
                console.error("❌ No se pudo generar la imagen de Rockie.");
                return await interaction.editReply({
                    content: "❌ No se pudo generar la imagen de tu Rockie."
                });
            }

            // Obtener datos del usuario
            const user = await UserServices.getUser(userId);
            console.log(`✅ Usuario encontrado en BD: ${user ? user.userId : "No encontrado"}`);

            // Checks if the user exists in the database.
            if (!user) {
                console.error("❌ No se encontró al usuario en la base de datos.");
                return await interaction.editReply({
                    content: "❌ No se encontró información de tu cuenta."
                });
            }

            // Creates an embed message with the Rockie's details.
            const embed = new EmbedBuilder()
                .setTitle(`🐻 Tu Rockie - ${rockie.name}`)
                .setDescription(`Aquí está tu Rockie con su información actual:`)
                .addFields(
                    { name: "⭐ Nivel", value: `${rockie.level}`, inline: true },
                    { name: "💰 RockieCoins", value: `${user.rockyCoins}`, inline: true },
                    { name: "💎 RockieGems", value: `${user.rockyGems}`, inline: true }
                )
                .setColor("#3498db");

            // Attaches the Rockie image to the embed message.
            const attachment = new AttachmentBuilder(rockieImageBuffer, { name: "rockie.png" });

            // ✅ Editar la respuesta diferida
            await interaction.editReply({ embeds: [embed], files: [attachment] });

        } catch (error) {
            console.error("❌ Error ejecutando /rockie:", error);

            const errorMsg = "❌ Hubo un error al mostrar tu Rockie. Inténtalo más tarde.";

            if (interaction.deferred) {
                await interaction.editReply({ content: errorMsg });
            } else {
                await interaction.reply({ content: errorMsg, ephemeral: true });
            }
        }
    },
};
