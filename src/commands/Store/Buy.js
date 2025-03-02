const { SlashCommandBuilder } = require("discord.js");
const storeInstance = require("../../services/Store/storeService");

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

    async execute(interaction) {
        await interaction.deferReply(); // ✅ Prevents timeout

        try {
            const category = interaction.options.getString("category");
            const itemName = interaction.options.getString("item");

            // ✅ Ensure `storeInstance` exists before calling `buyItem()`
            if (!storeInstance || typeof storeInstance.buyItem !== "function") {
                throw new Error("❌ storeInstance is undefined or buyItem() does not exist.");
            }
            // ✅ Process the purchase
            const result = await storeInstance.buyItem(interaction.user.id, itemName);

            // ✅ Use editReply() instead of reply()
            return interaction.editReply(result.message);
        } catch (error) {
            console.error("❌ Error al ejecutar el comando:", error);
            return interaction.editReply("❌ Hubo un error al procesar tu compra.");
        }
    }
};
