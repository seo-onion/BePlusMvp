const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const DiscountService = require("../../services/tiendita/discountServices");
const generateQR = require("../../utils/qr/qrGenerator");
const Discounts = require("../../models/Tiendita/Discount");

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
        await interaction.deferReply();

        const name = interaction.options.getString("nombre");
        const category = interaction.options.getString("categoria");
        const userId = interaction.user.id;

        try {
            // Intentar realizar la compra usando el service
            const compraExitosa = await DiscountService.buyItemByCategoryAndName({ userId, name, category });

            if (!compraExitosa) {
                return await interaction.editReply("❌ No se pudo realizar la compra. Verifica el nombre, la categoría o tus Rocky Gems.");
            }


            const discount = await DiscountService.getItemByCategoryAndName({ name, category })

            const userCoupon = await DiscountService.validateCoupon({ userId, discount })
            if (!userCoupon) {
                return await interaction.editReply("❌ No se pudo realizar el canje");
            }

            const qrContent = `http://localhost:3000/cupones/validar/${userCoupon.token}`;
            const qrImage = await generateQR(qrContent, { returnImage: true });
            const qrAttachment = new AttachmentBuilder(qrImage, { name: "qr_descuento.png" });



            await interaction.editReply({
                content: `✅ Has adquirido **${discount.name}** con ${discount.discount}% de descuento.\n📥 Aquí tienes tu QR. Guárdalo para canjearlo.`,
                files: [qrAttachment],
            });

        } catch (error) {
            console.error("❌ Error en /adquirirdescuento:", error.message);
            await interaction.editReply("❌ Ocurrió un error inesperado al procesar tu compra.");
        }
    }
};
