const { SlashCommandBuilder } = require("discord.js");
const storeInstance = require("../../services/Store/storeService");
const createErrorEmbed = require("../../utils/embed/errorEmbed");

let categoryChoices = [];

async function loadCategories() {
    try {
        const categories = await storeInstance.getCategories();
        if (Array.isArray(categories) && categories.length > 0) {
            categoryChoices = categories.map(cat => ({ name: cat, value: cat }));
            console.log("✅ Categorías cargadas:", categoryChoices);
        } else {
            console.warn("⚠️ No hay categorías disponibles.");
        }
    } catch (error) {
        console.error("❌ Error al cargar categorías:", error);
    }
}

loadCategories();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("comprar1")
        .setDescription("Compra un artículo de la tienda Rocky.")
        .addStringOption(option =>
            option.setName("category")
                .setDescription("Elige una categoría de artículos.")
                .setRequired(true)
                .addChoices(...categoryChoices)
        )
        .addStringOption(option =>
            option.setName("item")
                .setDescription("Nombre del artículo que deseas comprar.")
                .setRequired(true)
        ),

    restricted: true, // ✅ Solo usuarios autorizados (ej: Beta Testers)

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const category = interaction.options.getString("category");
            const itemName = interaction.options.getString("item");
            const userId = interaction.user.id;

            console.log(`🛒 Usuario ${userId} comprando: ${itemName} (Categoría: ${category})`);

            const result = await storeInstance.buyItem(userId, itemName, category);

            if (!result.embed) {
                console.error("❌ Error: La función buyItem() no devolvió un embed válido.");
                return interaction.editReply("❌ No se pudo procesar tu compra.");
            }

            return interaction.editReply({ embeds: [result.embed] });

        } catch (error) {
            console.error("❌ Error en el comando /comprar:", error);
            const errorEmbed = createErrorEmbed("❌ Hubo un error al procesar tu compra. Intenta más tarde.");
            return interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};

