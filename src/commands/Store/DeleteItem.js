const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { Items } = require("../../models/Item/Items.js");
const { Store } = require("../../models/Store/Store.js");
const createAlertEmbed = require("../../utils/alertEmbed"); 

const DEV = process.env.DEV_ROLE;
const ADMIN = process.env.ADMIN_ROLE;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("eliminar")
        .setDescription("Elimina un artículo en la tienda.")
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
        const category = interaction.options.getString("category").toLowerCase();
        const itemName = interaction.options.getString("item");

        const member = interaction.member;

        // ✅ Validación de roles: debe tener al menos uno de los dos roles
        if (!member.roles.cache.has(DEV) && !member.roles.cache.has(ADMIN)) {
            const embed = createAlertEmbed("🚫 No No deberías estar probando estos comandos");
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        try {
            // Encuentra la Store, suponiendo que hay una sola
            let store = await Store.findOne();
            if (!store) {
                store = await Store.create({ name: "Rocky Store" });
            }

            // Verifica si es que existe el item que quieres eliminar
            let item = await Items.findOne({ where: { name: itemName, category } });

            if (item) {
                await item.destroy();
                return interaction.reply(`✅ En la categoría **${category}** se ha eliminado el artículo **${itemName}**.`);
            } else {
                return interaction.reply(`❌ No se encontró el artículo **${itemName}** en la categoría **${category}**.`);
            }
        } catch (error) {
            console.error("❌ Error al eliminar el artículo:", error);
            return interaction.reply("❌ Hubo un error al intentar eliminar el artículo.");
        }
    }
};
