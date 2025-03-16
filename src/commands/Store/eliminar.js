const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { Items } = require("../../models/Item/Items.js");
const { Store } = require("../../models/Store/Store.js");
const createAlertEmbed = require("../../utils/alertEmbed");

const DEV = process.env.DEV_ROLE;
const ADMIN = process.env.ADMIN_ROLE;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("eliminar")
        .setDescription("Elimina un artículo de la tienda Rocky.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName("category")
                .setDescription("Nombre de la categoría.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("item")
                .setDescription("Nombre del artículo que deseas eliminar.")
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const category = interaction.options.getString("category").toLowerCase();
        const itemName = interaction.options.getString("item");
        const member = interaction.member;

        if (!member.roles.cache.has(DEV) && !member.roles.cache.has(ADMIN)) {
            const embed = createAlertEmbed("🚫 No tienes permisos para ejecutar este comando.");
            return await interaction.editReply({ embeds: [embed] });
        }

        try {
            let store = await Store.findOne();
            if (!store) store = await Store.create({ name: "Rocky Store" });

            const item = await Items.findOne({ where: { name: itemName, category } });

            if (!item) {
                return await interaction.editReply(`❌ No se encontró el artículo **${itemName}** en la categoría **${category}**.`);
            }

            await item.destroy();
            return await interaction.editReply(`✅ Artículo **${itemName}** eliminado de la categoría **${category}**.`);

        } catch (error) {
            console.error("❌ Error al eliminar el artículo:", error);
            return interaction.editReply("❌ Hubo un error al intentar eliminar el artículo.");
        }
    }
};

