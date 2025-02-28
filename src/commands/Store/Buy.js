const { SlashCommandBuilder } = require("discord.js");
const { claimRockyCoins } = require("../../services/google/fitService")
const ROLE_ID = process.env.TESTER_ROLE;
const {storeInstance} = require("../../services/Store/storeService");
const { ITEM_CATEGORIES } = require("../../models/Item/Items.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("comprar")
        .setDescription("Haz que tu Rocky se vista como quieras! :D")
        .addStringOption(option =>
            option.setName("category")
                .setDescription("Elige una categoría de artículos")
                .setRequired(true)
                .addChoices(
                    ...ITEM_CATEGORIES.map(category => (
                    { name: category.charAt(0).toUpperCase() + category.slice(1), value: category }))
                )
        )
        .addStringOption(option =>
            option.setName("item")
                .setDescription("Nombre del artículo que deseas comprar")
                .setRequired(true)
        ),
        async execute(interaction) {
        const category = String(interaction.options.getString("category"));
        const itemName = String(interaction.options.getString("item"));

        // Validacion para ver si es que la categoria existe
            if (!ITEM_CATEGORIES.includes(category)) {
            return interaction.reply("❌ Categoría no válida.");
        }
            const store = storeInstance;
            // Validacion para ver si es que store tiene
        const item = await store.getItemByCategoryAndName(category, itemName);
        if (!item) {
            return interaction.reply(`❌ El artículo **${itemName}** no existe en la categoría **${category}**.`);
        }
        // Procesando la currency
        const result = await store.buyItem(interaction.user.id, itemName);
        return interaction.reply(result.message);
    }
};