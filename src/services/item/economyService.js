const Item = require("../../models/Item/Items");
const Transaction = require("../../models/Item/Transaction")
require("dotenv").config();

exports.createBadges = async () => {
    await Item.create({
        name: "RockyCoin",
        description: "Moneda virtual para comprar items.",
        price: 1,
        category: "badge"
    });

    await Item.create({
        name: "RockyGem",
        description: "Moneda virtual para acceder a descuentos y promociones.",
        price: 1,
        category: "badge"
    });
}

exports.createTransaction = async(req) => {
    const { userId, amount, type, productId} = req
    console.log("Creando transaccion")
    try {
        const transaction = await Transaction.create({
            userId,
            amount,
            type,
            productId
        });

        console.log(`✅ Transacción creada con exito`);
        return { success: true, message:`Transacción creada: ${transaction.id} | Usuario: ${userId} | Monto: ${amount}`,  transaction };
    } catch (error) {
        console.error("❌ Error al crear la transacción:", error);
        return { success: false, message: "Error al crear la transacción." };
    }
}
