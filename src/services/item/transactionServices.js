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

    // This function checks if the user has already claimed both rewards from image-validation today.
    static async canClaimDailyImageRewardPair(userId) {
        const IMAGE_REWARD_IDS = ['rockyCoin', '5e617361-e1b6-4c2e-9597-f1d915fcdbe1'];
        const COIN_ID = IMAGE_REWARD_IDS[0];
        const GEM_ID = IMAGE_REWARD_IDS[1];

        const MAX_SECONDS_APART = 60;

        // Cooldown en horas
        const CLAIM_COOLDOWN_HOURS = 24;

        if (!userId) {
            console.error("canClaimDailyImageRewardPair: Missing userId");
            return false;
        }

        try {
            // 1. Encontrar la última transacción de CADA tipo de recompensa de imagen para el usuario
            const findLastReward = async (productId) => {
                return Transaction.findOne({
                    where: {
                        userId: userId,
                        type: "reward",
                        productId: productId
                    },
                    order: [['createdAt', 'DESC']], // Obtener la más reciente
                    attributes: ['createdAt'] // Solo necesitamos la fecha
                });
            };

            const lastCoinTransaction = await findLastReward(COIN_ID);
            const lastGemTransaction = await findLastReward(GEM_ID);

            // Si nunca ha recibido una de las dos, definitivamente puede reclamar el par
            if (!lastCoinTransaction || !lastGemTransaction) {
                console.log(`Usuario ${userId} nunca ha recibido ${!lastCoinTransaction ? COIN_ID : GEM_ID}. Puede reclamar.`);
                return true;
            }

            const lastCoinTime = lastCoinTransaction.createdAt;
            const lastGemTime = lastGemTransaction.createdAt;

            console.log(`Última ${COIN_ID} para ${userId}: ${lastCoinTime.toISOString()}`);
            console.log(`Última ${GEM_ID} para ${userId}: ${lastGemTime.toISOString()}`);

            // 2. Verificar si las últimas transacciones ocurrieron juntas
            const timeDifferenceSeconds = Math.abs(lastCoinTime.getTime() - lastGemTime.getTime()) / 1000;

            console.log(`Diferencia de tiempo entre últimas recompensas: ${timeDifferenceSeconds.toFixed(2)} segundos.`);

            if (timeDifferenceSeconds > MAX_SECONDS_APART) {
                // Las últimas recompensas de cada tipo no ocurrieron juntas.
                // Esto implica que la última vez que recibió el *par* (si alguna vez lo hizo)
                // fue antes de estas dos transacciones separadas. Por lo tanto, puede reclamar.
                console.log(`Las últimas recompensas para ${userId} están demasiado separadas en el tiempo. Puede reclamar.`);
                return true;
            }

            // 3. Si ocurrieron juntas, verificar el cooldown desde la más reciente de las dos
            const lastPairClaimTime = new Date(Math.max(lastCoinTime.getTime(), lastGemTime.getTime()));
            const cooldownEndTime = new Date(lastPairClaimTime.getTime() + CLAIM_COOLDOWN_HOURS * 60 * 60 * 1000);
            const now = new Date();

            console.log(`Último reclamo del par para ${userId} (estimado): ${lastPairClaimTime.toISOString()}`);
            console.log(`Cooldown termina: ${cooldownEndTime.toISOString()}`);
            console.log(`Hora actual: ${now.toISOString()}`);

            if (now >= cooldownEndTime) {
                // Han pasado más de 24 horas desde el último reclamo conjunto
                console.log(`Cooldown terminado para ${userId}. Puede reclamar.`);
                return true;
            } else {
                // Aún no han pasado 24 horas
                console.log(`Cooldown AÚN ACTIVO para ${userId}. No puede reclamar.`);
                return false;
            }

        } catch (error) {
            console.error("Error checking if user can claim daily image reward pair:", error.message);
            return false; // Seguro devolver false en caso de error
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
