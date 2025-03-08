const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const storeInstance = require("../../services/Store/storeService");

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

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const category = interaction.options.getString("category");
            const itemName = interaction.options.getString("item");

            if (!storeInstance || typeof storeInstance.buyItem !== "function") {
                throw new Error("❌ storeInstance is undefined or buyItem() does not exist.");
            }

            const result = await storeInstance.buyItem(interaction.user.id, itemName, category);

            if (!result.embed) {
                console.error("❌ Error: `buyItem()` did not return a valid embed.");
                return interaction.editReply("❌ Hubo un error al procesar tu compra.");
            }

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