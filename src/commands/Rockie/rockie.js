const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require("discord.js");
const { getRockie, createRockie, renderRockie } = require("../../services/rockie/rockieService");
const  Users  = require("../../models/User/Users");

console.log("📌 Users Model Import:", Users); // Verificar si Users está definido al inicio

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rockie")
        .setDescription("Muestra tu Rockie. Si no tienes uno, se creará automáticamente."),

    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;

        console.log(`📌 Ejecutando /rockie para el usuario: ${username} (${userId})`);

        let rockie = await getRockie(userId);
        if (!rockie) {
            console.log(`🔹 No se encontró un Rockie para ${username}. Creando uno nuevo...`);
            rockie = await createRockie(userId, username);
        } else {
            console.log(`✅ Rockie encontrado: ${rockie.name} (Nivel ${rockie.level})`);
        }

        const rockieBuffer = await renderRockie(userId);
        if (!rockieBuffer) {
            console.log("❌ Error al generar la imagen de Rockie.");
            return interaction.reply("❌ No se pudo generar la imagen de tu Rockie.");
        }

        // 📌 Obtener información del usuario
        console.log("🔍 Buscando usuario en la base de datos...");
        console.log("🔍 Modelo Users:", Users);
        
        try {
            const user = await Users.findByPk(userId);
            console.log(`✅ Usuario encontrado en BD: ${user ? user.userId : "No encontrado"}`);

            if (!user) {
                return interaction.reply("❌ No se encontró información de usuario en la base de datos.");
            }

            // 📌 Crear un embed con la información de Rockie
            const embed = new EmbedBuilder()
                .setTitle(`🐻 Tu Rockie - ${rockie.name}`)
                .setDescription(`Aquí está tu Rockie con su información actual:`)
                .addFields(
                    { name: "⭐ Nivel", value: `${rockie.level}`, inline: true },
                    { name: "💰 RockieCoins", value: `${user.rockyCoins}`, inline: true },
                    { name: "💎 RockieGems", value: `${user.rockyGems}`, inline: true }
                )
                .setColor("#3498db");

            // 📌 Enviar la imagen junto con la información
            const attachment = new AttachmentBuilder(rockieBuffer, { name: "rockie.png" });
            await interaction.reply({ embeds: [embed], files: [attachment] });

        } catch (error) {
            console.error("❌ Error al obtener la información del usuario:", error);
            return interaction.reply("❌ Hubo un error al obtener la información de tu cuenta.");
        }
    },
};

