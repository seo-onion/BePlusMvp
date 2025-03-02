/*const { Items } = require("../Item/Items");
const { Currency } = require("../Fit/Currency");

class Store {
    constructor() {
        if (!Store.instance) {
            Store.instance = this;
        }
        return Store.instance;
    }

    // Fetch all items in the store
    async getItems() {
        return await Items.findAll();
    }

    // Fetch items by category (e.g., "clothes", "colors")
    async getItemsByCategory(category) {
        return await Items.findAll({ where: { category } });
    }

    // Get the price of an item
    async getItemPrice(itemName) {
        const item = await Items.findOne({ where: { name: itemName } });
        return item ? item.price : null;
    }

    // Buy an item
    async buyItem(userId, itemName) {
        const item = await Items.findOne({ where: { name: itemName } });
        if (!item) return { success: false, message: "❌ Item not found." };

        const userCurrency = await Currency.findOne({ where: { userId } });
        if (!userCurrency || userCurrency.rockyCoins < item.price) {
            return { success: false, message: `❌ You need ${item.price} RockyCoins to buy ${itemName}.` };
        }

        // Deduct currency
        userCurrency.rockyCoins -= item.price;
        await userCurrency.save();

        return { success: true, message: `✅ You bought ${item.name} for ${item.price} RockyCoins! 🎉` };
    }
    async getItemByCategoryAndName(category, itemName) {
        return await Items.findOne({ where: { category, name: itemName } });
    }
}

const storeInstance = new Store();
module.exports = storeInstance;
*/
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const {Items} = require("../Item/Items");

const Store = sequelize.define("Store", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, { timestamps: false });


Store.hasMany(Items, { foreignKey: "storeId", onDelete: "CASCADE" });
Items.belongsTo(Store, { foreignKey: "storeId" });

module.exports = { Store };
