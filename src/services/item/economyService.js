const Item = require("../../models/Item/Items");
const Transaction = require("../../models/Item/Transaction");
const { Users } = require("../../models/User/Users");
require("dotenv").config();

// Creates initial badge items in the database.
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
};

// Handles the creation of a transaction and logs the process.
exports.createTransaction = async (req) => {
    const { userId, amount, type, productId } = req;
    console.log("Creando transaccion");
    try {
        const transaction = await Transaction.create({
            userId,
            amount,
            type,
            productId
        });

        console.log(`✅ Transacción creada con exito`);
        return {
            success: true,
            message: `Transacción creada: ${transaction.id} | Usuario: ${userId} | Monto: ${amount}`,
            transaction
        };
    } catch (error) {
        console.error("❌ Error al crear la transacción:", error);
        return { success: false, message: "Error al crear la transacción." };
    }
};

// Adds RockyGems to a user's account and records the transaction.
exports.addRockyGems = async (req) => {
    try {
        console.log("Añadiendo rockyGems");
        const { userId, quantity } = req;
        const user = await Users.findByPk(userId);

        const oldRockyGems = user.rockyGems;
        const newRockyGems = oldRockyGems + quantity;

        await user.update({
            rockyGems: newRockyGems
        });

        await this.createTransaction({
            userId: userId,
            amount: quantity,
            type: "reward",
            productId: "5e617361-e1b6-4c2e-9597-f1d915fcdbe1"
        });

        return true;
    } catch (error) {
        console.error("❌ Error al añadir RockyGems:", error);
        return false;
    }
};

// Adds RockyCoins to a user's account and records the transaction.
exports.addRockyCoins = async (req) => {
    try {
        console.log("Añadiendo rockyCoins");
        const { userId, quantity } = req;
        const user = await Users.findByPk(userId);

        const oldRockyCoins = user.rockyCoins;
        const newRockyCoins = oldRockyCoins + quantity;

        await user.update({
            rockyCoins: newRockyCoins
        });

        await this.createTransaction({
            userId: userId,
            amount: quantity,
            type: "reward",
            productId: "db98908a-466d-4681-a40a-fe8e06af9d8b"
        });

        return true;
    } catch (error) {
        console.error("❌ Error al añadir RockyCoins:", error);
        return false;
    }
};
