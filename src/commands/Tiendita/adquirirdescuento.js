const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const DiscountService = require("../../services/tiendita/discountServices");
const generateQR = require("../../utils/qr/qrGenerator");
const createErrorEmbed = require("../../utils/embed/errorEmbed");
const alertEmbedList = require("../../utils/embed/alertEmbedList");
const successEmbed = require("../../utils/embed/successEmbed");
const UserService = require("../../services/user/userService");
const ListObjectsFormat = require("../../utils/ListObjects");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("adquirirdescuento")
        .setDescription("Compra un descuento por nombre y categoría.")
        .addStringOption(option =>
            option.setName("nombre")
                .setDescription("Nombre del descuento")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("categoria")
                .setDescription("Categoría del descuento")
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const name = interaction.options.getString("nombre");
        const category = interaction.options.getString("categoria");
        const userId = interaction.user.id;

        try {
            const user = await UserService.getUser(userId);
            if (!user) {
                return interaction.editReply({
                    embeds: [createErrorEmbed({
                        title: "❌ Usuario No Encontrado",
                        description: "No se pudo encontrar tu perfil en la base de datos."
                    })],
                    ephemeral: true
                });
            }

            const categoryExists = await DiscountService.categoryExists(category);
            if (!categoryExists) {
                const allCategories = await DiscountService.getAllCategories();
                const formatted = allCategories.length
                    ? `\`\`\`yaml\n${allCategories.map(c => `- ${c.category}`).join("\n")}\n\`\`\``
                    : "❌ No hay categorías disponibles.";

                return interaction.editReply({
                    embeds: [alertEmbedList("❌ Categoría No Encontrada",
                        `La categoría **${category}** no existe.`,
                        [{ name: "📂 Categorías Disponibles", value: formatted }]
                    )],
                    ephemeral: true
                });
            }

            const discount = await DiscountService.getItemByCategoryAndName({ name, category });
            if (!discount) {
                const items = await DiscountService.getAllByCategory(category);
                return interaction.editReply({
                    embeds: [alertEmbedList("⚠️ Descuento No Encontrado",
                        `No encontramos **${name}** en la categoría **${category}**. Aquí tienes los disponibles:`,
                        [{ name: `🎟️ Descuentos en ${category}`, value: ListObjectsFormat(items, "❌ No hay descuentos en esta categoría.") }]
                    )],
                    ephemeral: true
                });
            }

            if (user.rockyGems < discount.price) {
                const affordable = await DiscountService.getAffordableForUser(category, user.rockyGems);

                return interaction.editReply({
                    embeds: [alertEmbedList("❌ Fondos Insuficientes",
                        `Necesitas **${discount.price}** Rocky Gems para adquirir **${name}**, pero solo tienes **${user.rockyGems}**.`,
                        [{
                            name: "🎁 Puedes adquirir estos descuentos:",
                            value: ListObjectsFormat(affordable, "❌ No puedes adquirir ningún descuento con tus Gems actuales.")
                        }]
                    )],
                    ephemeral: true
                });
            }

            const compraExitosa = await DiscountService.buyItemByCategoryAndName({ userId, name, category });
            if (!compraExitosa) {
                return interaction.editReply({
                    embeds: [createErrorEmbed({
                        title: "😥 ¡Oh no! No pudimos completar tu compra",
                        description: "Intenta de nuevo más tarde o contacta con un administrador si el problema continúa. 💬"
                    })],
                    ephemeral: true
                });
            }

            const userCoupon = await DiscountService.validateCoupon({ userId, discount });
            if (!userCoupon) {
                return interaction.editReply({
                    embeds: [createErrorEmbed({
                        title: "❌ No se pudo generar tu cupón",
                        description: "Algo salió mal al validar tu compra. Intenta más tarde o contacta con un admin. 🛠️"
                    })],
                    ephemeral: true
                });
            }

            const qrContent = `http://localhost:3000/cupones/validar/${userCoupon.token}`;
            const qrImage = await generateQR(qrContent, { returnImage: true });
            const qrAttachment = new AttachmentBuilder(qrImage, { name: "qr_descuento.png" });

            return interaction.editReply({
                embeds: [successEmbed({
                    title: "🎉 ¡Descuento Adquirido!, \n  ¡Felicidades! Has obtenido un descuento increíble. \n Te recomendamos guardar tu QR para canjearlo cuando lo necesites. 📲✨",
                    description: `Has adquirido **${compraExitosa.name}** con **${compraExitosa.discount}%** de descuento.\n\n📥 Aquí tienes tu QR. Guárdalo para canjearlo.`,
                    item: compraExitosa,
                    category: compraExitosa.category, 
                    itemName: compraExitosa.name
                })],
                files: [qrAttachment],
                ephemeral: true
            });

        } catch (error) {
            console.error("Error en /adquirirdescuento:", error.message);
            return interaction.editReply({
                embeds: [createErrorEmbed()],
                ephemeral: true
            });
        }
    }
};
