const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const storeInstance = require("../../services/Store/storeService");
const createErrorEmbed = require("../../utils/errorEmbed");

// ✅ Fetch categories BEFORE defining the command
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

// ✅ Call this function when the bot starts
loadCategories();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("comprar")
        .setDescription("Compra un artículo de la tienda Rocky.")
        .addStringOption(option =>
            option.setName("category")
                .setDescription("Elige una categoría de artículos")
                .setRequired(true)
                .addChoices(...categoryChoices) // ✅ Uses preloaded choices
        )
        .addStringOption(option =>
            option.setName("item")
                .setDescription("Nombre del artículo que deseas comprar")
                .setRequired(true)
        ),

        // ✅ The command is restricted so that only Beta Testers can use it
        restricted: true,

    async execute(interaction) {
        // Defer the response to avoid errors with editReply()
        await interaction.deferReply({ ephemeral: true });

        try {
            const category = interaction.options.getString("category");
            const itemName = interaction.options.getString("item");
            const userId = interaction.user.id;

            console.log(`🛒 Usuario ${userId} intenta comprar: ${itemName} (Categoría: ${category})`);

            // 🚨 Validate if the store is instantiated.
            if (!storeInstance || typeof storeInstance.buyItem !== "function") {
                console.error("❌ Error: storeInstance no está definido o buyItem() no existe.");
                return interaction.editReply({ 
                    embeds: [createErrorEmbed("⚠️ No se pudo acceder a la tienda en este momento. Intenta más tarde.")] 
                });
            }

            // The result is an embed which is the response of buying an Item
            const result = await storeInstance.buyItem(interaction.user.id, itemName, category);

            // If the result is not an embed, returns an error
            if (!result.embed) {
                console.error("❌ Error: `buyItem()` did not return a valid embed.");
                return interaction.editReply("❌ Hubo un error al procesar tu compra.");
            }

            // If the result is embed it returns a reply
            return interaction.editReply({ embeds: [result.embed] });

        } catch (error) {
            console.error("❌ Error executing the command:", error);

            const errorEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle("❌ Error en la Compra")
                .setDescription("Hubo un error al procesar tu compra. Inténtalo nuevamente.")
                .setFooter({ text: "Tienda Rocky • Contacta a un admin si el problema persiste." })
                .setTimestamp();

            return interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};