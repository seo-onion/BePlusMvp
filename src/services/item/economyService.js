const Item = require("../../models/Item/Items");
const Transaction = require("../../models/Item/Transaction")
const User = require("../../models/User/Users")
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

exports.createTransaction = async (req) => {
    const { userId, amount, type, productId } = req
    console.log("Creando transaccion")
    try {
        const transaction = await Transaction.create({
            userId,
            amount,
            type,
            productId
        });

        console.log(`✅ Transacción creada con exito`);
        return { success: true, message: `Transacción creada: ${transaction.id} | Usuario: ${userId} | Monto: ${amount}`, transaction };
    } catch (error) {
        console.error("❌ Error al crear la transacción:", error);
        return { success: false, message: "Error al crear la transacción." };
    }
}

exports.addRockyGems = async (req) => {
    try {
        console.log("Añadiendo rockyGems")
        const { userId, quantity } = req;
        const user = await User.findByPk(userId);

        const oldRockyGems = user.rockyGems
        const newRockyGems = oldRockyGems + quantity
        user.update({
            rockyGems: newRockyGems
        })

        await this.createTransaction({
            userId: userId,
            amount: quantity,
            type: "reward",
            productId: "5e617361-e1b6-4c2e-9597-f1d915fcdbe1"
        })

        return true
    } catch {
        return false
    }
}

exports.addRockyCoins = async (req) => {
    try {
        console.log("Añadiendo rockyCoins")
        const { userId, quantity } = req;
        const user = await User.findByPk(userId);

        const oldRockyCoins = user.rockyCoins
        const newRockyCoins = oldRockyCoins + quantity
        user.update({
            rockyCoins: newRockyCoins
        })

        await this.createTransaction({
            userId: userId,
            amount: quantity,
            type: "reward",
            productId: "db98908a-466d-4681-a40a-fe8e06af9d8b"
        })

        return true
    } catch {
        return false
    }
}