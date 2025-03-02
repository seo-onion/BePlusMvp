const { Items } = require("../../models/Item/Items");
const { Store } = require("../../models/Store/Store");
const { Currency } = require("../../models/Fit/Currency");
const {Users} = require("../../models/User/Users.js");
const {UserItems} = require("../../models/Item/UserItems");
const {Transaction} = require("../../models/Item/Transaction");



class StoreManager {
    constructor() {
        if (!StoreManager.instance) {
            StoreManager.instance = this;
            this.store = null; // ✅ Cache the store instance
        }
        return StoreManager.instance;
    }

    // ✅ Get or create the store once (caching mechanism)
    async getStore() {
        if (this.store) return this.store; // ✅ Return cached store if available

        let store = await Store.findOne();
        if (!store) {
            store = await Store.create({ name: "Rocky Store" });
        }

        this.store = store; // ✅ Cache the store instance
        return store;
    }

    // Encontrar el usuario con el id


    // ✅ Get all items
    async getItems() {
        const store = await this.getStore();
        return await Items.findAll({ where: { storeId: store.id } });
    }

    // ✅ Get items by category
    async getItemsByCategory(category) {
        const store = await this.getStore();
        return await Items.findAll({ where: { category, storeId: store.id } });
    }

    // ✅ Get a single item by category and name
    async getItemByCategoryAndName(category, itemName) {
        const store = await this.getStore();

        return await Items.findOne({
            where: {
                category: category, // ✅ `category` is already a string
                storeId: store.id, // ✅ No need to convert `storeId`
                name: itemName
            }
        });
    }

    // ✅ Buy an item with RockyCoins
    async buyItem(userId, itemName) {
        const store = await this.getStore();
        const item = await Items.findOne({
            where: {
                name: itemName,
                storeId: store.id
            }
        });

        if (!item) {
            return {
                success: false,
                message: "❌ Item no encontrado!"
            };
        }
        console.log("✅ Item encontrado:", item.name);

        const user = await Users.findByPk(userId);

        if (!user) {
            return {
                success: false,
                message: "❌ Usuario no encontrado."
            };
        }

        console.log(`🔹 Usuario tiene ${user.rockyCoins} RockyCoins.`);
        console.log(`🔹 El precio del item es ${item.price} RockyCoins.`);

        // ✅ Check if the user has enough coins
        if (user.rockyCoins < item.price) {
            return {
                success: false,
                message: `❌ Necesitas **${item.price}** RockyCoins para comprar **${itemName}**. 
                          Te faltan **${item.price - user.rockyCoins}** RockyCoins.`
            };
        }

        // ✅ Deduct the price


        // ✅ Check if the user already owns the item to prevent duplicate error
        const existingPurchase = await UserItems.findOne(
            { where: { userId, itemId: item.id } }
        );

        if (existingPurchase) {
            return {
                success: false,
                message: "⚠️ Ya tienes este item."
            };
        }
        user.rockyCoins -= item.price;
        await user.save();
        // ✅ Create a new entry in the UserItem table
        await UserItems.create({
            userId,
            itemId: item.id,
        });

        // ✅ Create a transaction record
        await Transaction.create({
            userId,
            amount: item.price,
            type: "compra",
            productId: item.id, // ✅ No need to convert to string manually
        });

        return {
            success: true,
            message: `✅ Has comprado **${item.name}** por **${item.price}** RockyCoins! 🎉`
        };
    }
}

const storeInstance = new StoreManager();
module.exports = storeInstance;
