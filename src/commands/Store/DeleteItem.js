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

        // ✅ Validate if the roles are correct (it should have one of them (ADMIN OR DEV))
        if (!member.roles.cache.has(DEV) && !member.roles.cache.has(ADMIN)) {
            const embed = createAlertEmbed("🚫 No deberías estar probando estos comandos.");
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // ✅ Define the interaction at the beginning to avoid the error
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
        }

        try {
            // Validates if the user has the ROLE_ADMIN
            if (!member.roles.cache.has(ADMIN)) {
                console.log("No tienes los permisos para ejecutar este comando, no eres admin.");
                return await interaction.editReply({
                    content: "⛔ No tienes permisos para ejecutar este comando."
                });
            }

            // Finds or creates the Store
            let store = await Store.findOne();
            if (!store) {
                store = await Store.create({ name: "Rocky Store" });
            }

            // Finds or creates the Store
            const item = await Items.findOne({ where: { name: itemName, category } });

            // If the item exists it is destroyed in the DataBase
            if (item) {
                await item.destroy();
                return await interaction.editReply(`✅ En la categoría **${category}** se ha eliminado el artículo **${itemName}**.`);
            } else {
                return await interaction.editReply(`❌ No se encontró el artículo **${itemName}** en la categoría **${category}**.`);
            }

        } catch (error) {
            console.error("❌ Error al eliminar el artículo:", error);

            if (interaction.deferred || interaction.replied) {
                return await interaction.editReply("❌ Hubo un error al intentar eliminar el artículo.");
            } else {
                return await interaction.reply("❌ Hubo un error al intentar eliminar el artículo.", { ephemeral: true });
            }
        }
    }
};
