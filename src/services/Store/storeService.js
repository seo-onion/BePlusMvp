const { Items } = require("../../models/Item/Items");
const { Store } = require("../../models/Store/Store");
const { Currency } = require("../../models/Fit/Currency");

class StoreManager {
    // Hacer un singleton para que solo haya una sola tienda
    constructor() {
        if (!StoreManager.instance) {
            StoreManager.instance = this;
        }
        return StoreManager.instance;
    }

    // Obtener la unica instancia de tienda y ponerle un nombre
    async getStore() {
        let store = await Store.findOne();
        if (!store) {
            store = await Store.create({ name: "Rocky Store" });
        }
        return store;
    }

    // Obtener todos los items
    async getItems() {
        const store = await this.getStore();
        return await Items.findAll({ where: { storeId: store.id } });
    }

    // Obtener todos los items por categoria
    async getItemsByCategory(category) {
        const store = await this.getStore();
        return await Items.findAll({ where: { category, storeId: store.id } });
    }

    // Obtener un item por categoria y nombre
    async getItemByCategoryAndName(category, itemName) {
        const store = await this.getStore();

        console.log("🔹 Searching for item:");
        console.log("Category:", category, typeof category);
        console.log("Item Name:", itemName, typeof itemName);
        console.log("Store ID:", store.id, typeof store.id);

        // ✅ Ensure both inputs are converted to STRING
        return await Items.findOne({
            where: {
                category: category.toString(),
                storeId: store.id.toString(),
                name: itemName.toString()
            }
        });
    }

    // Comprar un item con el nombre
    async buyItem(userId, itemName) {
        const store = await this.getStore();
        const item = await Items.findOne(
            { where:
                    { name: itemName,
                        storeId: store.id.toString(),
                    }
            });

        if (!item) return {
            success: false, message: "❌ Item no encontrado!"
        };

        const userCurrency = await Currency.findOne({ where: { userId } });
        if (!userCurrency || userCurrency.rockyCoins < item.price) {
            return { success: false, message: `❌ Tu necesitas ${item.price} RockyCoins para comprar ${itemName}.
                                                   Te faltan ${item.price-userCurrency.rockyCoins}.` };
        }

        // Arreglar currency
        userCurrency.rockyCoins -= item.price;
        await userCurrency.save();

        return { success: true, message: `✅ Tu compraste ${item.name} por ${item.price} RockyCoins! 🎉` };
    }
}

const storeInstance = new StoreManager();
module.exports = storeInstance;
