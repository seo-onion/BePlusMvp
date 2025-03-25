const { Op } = require("sequelize");
const Transaction = require("../../models/Item/Transaction");

class TransactionService {

    //Get transaction by Id
    static async getTransaction(identifier) {
        try {
            const transaction = await Transaction.findByPk(identifier);
            return transaction || null;
        } catch (error) {
            console.error("Error getting transaction: ", error.message);
            return null;
        }
    }

    // get transaction by User Id
    static async getTransactionsByUser(userId) {
        try {
            const transactions = await Transaction.findAll({
                where: { userId }
            });

            return transactions.length > 0 ? transactions : null;
        } catch (error) {
            console.error("Error getting user transactions: ", error.message);
            return null;
        }
    }

    // get a transaction by item id
    static async getTransactionsByProduct(productId) {
        try {
            const transactions = await Transaction.findAll({
                where: { productId }
            });

            return transactions.length > 0 ? transactions : null;
        } catch (error) {
            console.error("Error getting product transactions: ", error.message);
            return null;
        }
    }

    // Find the last reward transaction of the day for a user
    static async getLastDailyReward(userId) {
        try {
            if (!userId) {
                console.error("Missing userId");
                return null;
            }

            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

            const lastClaim = await Transaction.findOne({
                where: {
                    userId: userId,
                    type: "reward",
                    productId: "rockyCoin",
                    createdAt: { [Op.between]: [startOfDay, endOfDay] },
                }
            });

            return lastClaim || null;
        } catch (error) {
            console.error("Error getting last daily reward: ", error.message);
            return null;
        }
    }

    // Get all transactions
    static async getAllTransactions() {
        try {
            const transactions = await Transaction.findAll();

            return transactions.length > 0 ? transactions : null;
        } catch (error) {
            console.error("Error getting all transactions: ", error.message);
            return null;
        }
    }



    // Create a new transaction
    static async createTransaction(req) {
        try {
            const { userId, amount, type, productId } = req;

            // validate data
            if (!userId || !amount || !type || !productId) {
                console.error("Missing parameters: userId, amount, type or productId.");
                return null;
            }

            // create and return a new Transaction
            return await Transaction.create({ userId, amount, type, productId });
        } catch (error) {
            console.error("Error creating transaction:", error.message);
            return null;
        }
    }

    // Edit transaction by id
    static async editTransaction(req) {
        try {
            const { id, ...updateFields } = req;

            // find transaction
            const transaction = await this.getTransaction(id);

            if (!transaction) {
                console.error("Transaction not found");
                return null;
            }

            // update fields
            await transaction.update(updateFields);
            return transaction;
        } catch (error) {
            console.error("Error updating transaction: ", error.message);
            return null;
        }
    }

    // delete a transaction 
    static async deleteTransaction(id) {
        try {
            const transaction = await this.getTransaction(id);

            if (!transaction) {
                console.error("Transaction not found");
                return null;
            }

            await transaction.destroy();
            return transaction;
        } catch (error) {
            console.error("Error deleting transaction: ", error.message);
            return null;
        }
    }

}

module.exports = TransactionService;
