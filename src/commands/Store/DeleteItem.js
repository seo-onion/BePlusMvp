const { SlashCommandBuilder } = require("discord.js");
const Items  = require("../../models/Item/Items.js");
const Store  = require("../../models/Store/Store.js");
const ROLE_ADMIN = process.env.ADMIN;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("eliminar")
        .setDescription("Elimina un artículo en la tienda.")
        .addStringOption(option =>
            option.setName("category")
                .setDescription("Nombre de la categoria.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("item")
                .setDescription("Nombre del artículo que deseas eliminar.")
                .setRequired(true)
        )
        ,
    async execute(interaction) {
        const category = interaction.options.getString("category").toLowerCase();
        const itemName = interaction.options.getString("item");

        try {
            const member = interaction.member;
            // COMPROBAR QUE TIENE EL ROL DE ADMIN
            if (!member.roles.cache.has(ROLE_ADMIN)) {
                console.log("No Tienes los permisos para ejecutar este comando, no eres admin ");
                return interaction.reply({
                    content: "⛔ No tienes permisos para ejecutar este comando.",
                    ephemeral: true
                });
            } else{
                console.log("Tienes los permisos para ejecutar este comando. ");
            }
            // Encuentra la Store, suponiendo que hay una sola
            let store = await Store.findOne();
            if (!store) {
                store = await Store.create({ name: "Rocky Store" });
            }

            // Verifica si es que existe el item que quieres poner:
            let item = await Items.findOne(
                { where: { name: itemName, category } }
            );

            if (item) {
                // Si es que existe
                item.destroy();
                return interaction.reply(`✅ En la categoría **${category}** se ha eliminado el artículo **${itemName}**.`);
            } else {
                // En caso no exista
                return interaction.reply(`❌ Intente eliminar otro elemento de la categoría **${category}** con el item **${itemName}**)`);
            }
        } catch (error) {
            console.error("", error);
            return interaction.reply("❌ Hubo un error al actualizar el artículo.");
        }
    }
}