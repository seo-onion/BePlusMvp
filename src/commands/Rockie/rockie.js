const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require("discord.js");
const { getRockie, createRockie, renderRockie } = require("../../services/rockie/rockieService");
const {Users} = require("../../models/User/Users");

console.log("📌 Users Model Import:", Users); // Verifies if Users model is defined at the start.
module.exports = {
    data: new SlashCommandBuilder()
        .setName("rockie")
        .setDescription("Muestra tu Rockie. Si no tienes uno, se creará automáticamente."),

    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;

        console.log(`📌 Ejecutando /rockie para el usuario: ${username} (${userId})`);

        try {
            // Attempts to retrieve the user's Rockie, or creates one if it doesn't exist.
            let rockie = await getRockie(userId);
            if (!rockie) {
                console.log(`🔹 No se encontró un Rockie para ${username}. Creando uno nuevo...`);
                rockie = await createRockie(userId, username);
            } else {
                console.log(`✅ Rockie encontrado: ${rockie.name} (Nivel ${rockie.level})`);
            }

            // Generates the image for the user's Rockie.
            const rockieBuffer = await renderRockie(userId);
            if (!rockieBuffer) {
                console.log("❌ Error al generar la imagen de Rockie.");
                return await interaction.editReply("❌ No se pudo generar la imagen de tu Rockie.");
            }

            console.log("🔍 Buscando usuario en la base de datos...");
            const user = await Users.findByPk(userId);
            console.log(`✅ Usuario encontrado en BD: ${user ? user.userId : "No encontrado"}`);

            // Checks if the user exists in the database.
            if (!user) {
                return await interaction.editReply("❌ No se encontró información de usuario en la base de datos.");
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
            const attachment = new AttachmentBuilder(rockieBuffer, { name: "rockie.png" });

            await interaction.editReply({ embeds: [embed], files: [attachment] });

        } catch (error) {
            console.error("❌ Error al obtener la información del usuario:", error);

            const errorMessage = "❌ Hubo un error al obtener la información de tu cuenta.";

            // Handles error response depending on the interaction state.
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    },
};
