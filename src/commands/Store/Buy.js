const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const storeInstance = require("../../services/Store/storeService");
const createErrorEmbed = require("../../utils/embed/errorEmbed");

// Pre-fetches categories before defining the command to ensure they are available.
let categoryChoices = [];

async function loadCategories() {
    try {
        const categories = await storeInstance.getCategories();
        if (Array.isArray(categories) && categories.length > 0) {
            categoryChoices = categories.map(cat => ({ name: cat, value: cat }));
            console.log("✅ Categories loaded:", categoryChoices);
        } else {
            console.warn("⚠️ No categories found.");
        }
    } catch (error) {
        console.error("❌ Error loading categories:", error);
    }
}

// Calls the function to load categories when the bot starts.
loadCategories();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("comprar")
        .setDescription("Compra un artículo de la tienda Rocky.")
        .addStringOption(option =>
            option.setName("category")
                .setDescription("Elige una categoría de artículos")
                .setRequired(true)
                .addChoices(...categoryChoices) // Uses preloaded choices.
        )
        .addStringOption(option =>
            option.setName("item")
                .setDescription("Nombre del artículo que deseas comprar")
                .setRequired(true)
        ),

    restricted: true, // Restricts the command to specific users like Beta Testers.

    async execute(interaction) {
        // Defers the reply to prevent timeout issues during processing.
        await interaction.deferReply({ ephemeral: true });

        try {
            const category = interaction.options.getString("category");
            const itemName = interaction.options.getString("item");
            const userId = interaction.user.id;

            console.log(`🛒 Usuario ${userId} intenta comprar: ${itemName} (Categoría: ${category})`);

            // Validates if the store instance and its buyItem method are defined.
            if (!storeInstance || typeof storeInstance.buyItem !== "function") {
                console.error("❌ Error: storeInstance no está definido o buyItem() no existe.");
                return interaction.editReply({
                    embeds: [createErrorEmbed("⚠️ No se pudo acceder a la tienda en este momento. Intenta más tarde.")]
                });
            }

            // Attempts to process the purchase and returns the result as an embed.
            const result = await storeInstance.buyItem(interaction.user.id, itemName, category);

            // If no valid embed is returned, sends an error message.
            if (!result.embed) {
                console.error("❌ Error: `buyItem()` did not return a valid embed.");
                return interaction.editReply("❌ Hubo un error al procesar tu compra.");
            }

            // Sends the successful purchase response.
            return interaction.editReply({ embeds: [result.embed] });

        } catch (error) {
            console.error("❌ Error executing the command:", error);

            /*
            const errorEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle("❌ Error en la Compra")
                .setDescription("Hubo un error al procesar tu compra. Inténtalo nuevamente.")
                .setFooter({ text: "Tienda Rocky • Contacta a un admin si el problema persiste." })
                .setTimestamp();
             */
            return interaction.editReply({ embeds: [createErrorEmbed("❌ Error al efectuar la compra. Inténtalo nuevamente.")]});
        }
    }
};
