const Item = require("../../models/Item/Items");
const TransactionService = require("./transactionServices")
const UserService = require("../user/userService")

class EconomyService {

    static async createBadges() {
        await Item.create({
            name: "RockyCoin",
            description: "Moneda virtual para comprar items.",
            price: 1,
            category: "badge",
        });

        await Item.create({
            name: "RockyGem",
            description: "Moneda virtual para acceder a descuentos y promociones.",
            price: 1,
            category: "badge",
        });
    }


    static async addRockyGems(req) {
        try {
            
            const { userId, quantity } = req;
            
            // Find user
            let user = await UserService.getUser(userId);

            if (!user) {
                console.error(`User with id ${userId} not found.`);
                return false;
            }
            // Convert to JSON to avoid references to Sequelize
            user = user.toJSON();

            // Calculate new RockyCoins value
            const newRockyGems = user.rockyGems + quantity;

            await UserService.editUser({ 
                identifier: userId, 
                rockyGems: newRockyGems 
            });

            await TransactionService.createTransaction({
                userId: userId,
                amount: quantity,
                type: "reward",
                productId: "5e617361-e1b6-4c2e-9597-f1d915fcdbe1",
            });

            return true;

        } catch (error) {
            console.error("Error adding RockyGems:", error);
            return false;
        }
    }

    static async addRockyCoins(req) {
        try {

            const { userId, quantity } = req;
    
            // Find user
            let user = await UserService.getUser(userId);
    
            if (!user) {
                console.error(`User with id ${userId} not found.`);
                return false;
            }
    
            // Convert to JSON to avoid references to Sequelize
            user = user.toJSON();
    
            // Calculate new RockyCoins value
            const newRockyCoins = (user.rockyCoins || 0) + quantity;
    
            // Update the user with the new RockyCoins value
            await UserService.editUser({ 
                identifier: userId, 
                rockyCoins: newRockyCoins 
            });
    
            // Record the reward transaction
            await TransactionService.createTransaction({
                userId: userId,
                amount: quantity,
                type: "reward",
                productId: "rockyCoin",
            });
    
            return true;
        } catch (error) {
            console.error("Error adding RockyCoins:", error);
            return false;
        }
    }
    
}

module.exports = EconomyService;