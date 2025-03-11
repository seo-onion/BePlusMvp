const { SlashCommandBuilder } = require("discord.js");
const storeInstance = require("../../services/Store/storeService");
const createErrorEmbed = require("../../utils/errorEmbed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("comprar")
        .setDescription("Compra un artículo de la tienda Rocky.")
        .addStringOption(option =>
            option.setName("category")
                .setDescription("Elige una categoría de artículos")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("item")
                .setDescription("Nombre del artículo que deseas comprar")
                .setRequired(true)
        ),

    restricted: true, // ✅ Se restringe el comando para que solo Beta Testers lo usen

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true }); // 🔄 Deferimos la respuesta para evitar errores con editReply()

        try {
            const category = interaction.options.getString("category");
            const itemName = interaction.options.getString("item");
            const userId = interaction.user.id;

            console.log(`🛒 Usuario ${userId} intenta comprar: ${itemName} (Categoría: ${category})`);

            // 🚨 Validar que la tienda está inicializada
            if (!storeInstance || typeof storeInstance.buyItem !== "function") {
                console.error("❌ Error: storeInstance no está definido o buyItem() no existe.");
                return interaction.editReply({ 
                    embeds: [createErrorEmbed("⚠️ No se pudo acceder a la tienda en este momento. Intenta más tarde.")] 
                });
            }

            // 🛍️ Procesar la compra
            const result = await storeInstance.buyItem(userId, itemName);

            // 📩 Enviar mensaje con el resultado de la compra
            return interaction.editReply(result.message);

        } catch (error) {
            console.error("❌ Error al ejecutar el comando:", error);
            return interaction.editReply({ 
                embeds: [createErrorEmbed("❌ Hubo un error al procesar tu compra. Intenta nuevamente.")] 
            });
        }
    }
};
