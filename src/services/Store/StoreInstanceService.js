const Items = require("../../models/Item/Items");
const Store = require("../../models/Store/Store");
const User = require("../../models/User/Users.js");
const UserItems = require("../../models/Item/UserItems");
const Transaction = require("../../models/Item/Transaction");
const { EmbedBuilder } = require("discord.js");
const createErrorEmbed = require("../../utils/embed/errorEmbed");
const alertEmbedList = require("../../utils/embed/alertEmbedList");
const ListObjectsFormat = require("../../utils/ListObjects");

class StoreService {
    constructor() {
        if (!StoreService.instance) {
            StoreService.instance = this;
            this.store = null;
        }
        return StoreService.instance;
    }

    // ✅ Get or Create Store
    async getStore() {
        if (this.store) return this.store;

        let store = await Store.findOne();
        if (!store) {
            store = await Store.create({ name: "Rocky Store" });
        }

        this.store = store;
        return store;
    }

    // ✅ Fetch All Categories
    async getCategories() {
        try {
            const categories = await Items.findAll({
                attributes: ['category'],
                group: ['category'],
                raw: true,
            });
            return categories.map(cat => cat.category) || [];
        } catch (error) {
            console.log("❌ Error fetching categories:", error.message);
            return [];
        }
    }

    // ✅ Get All Items
    async getItems() {
        const store = await this.getStore();
        return await Items.findAll({ where: { storeId: store.id } });
    }

    // ✅ Get Items by Category
    async getItemsByCategory(category) {
        const store = await this.getStore();
        return await Items.findAll({ where: { category, storeId: store.id } });
    }

    // ✅ Get Item by Category and Name
    async getItemByCategoryAndName(category, itemName) {
        const store = await this.getStore();
        return await Items.findOne({
            where: { category, storeId: store.id, name: itemName },
        });
    }

    // ✅ Buy an Item with RockyCoins
    async buyItem(userId, itemName, category) {
        const store = await this.getStore();

        const item = await Items.findOne({
            where: { name: itemName, storeId: store.id, category },
        });

        // ✅ Handle Item Not Found
        if (!item) {
            return await this.handleItemNotFound(category, itemName);
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return {
                success: false,
                embed: createErrorEmbed("❌ Usuario No Encontrado. No se pudo encontrar tu perfil en la base de datos."),
            };
        }

        // ✅ Check User Balance
        if (user.rockyCoins < item.price) {
            return await this.handleInsufficientFunds(user, store, item, category);
        }

        // ✅ Check if Item Already Purchased
        const existingPurchase = await UserItems.findOne({ where: { userId, itemId: item.id } });
        if (existingPurchase) {
            return await this.handleAlreadyPurchased(userId, store, item, category);
        }

        // ✅ Complete Purchase
        user.rockyCoins -= item.price;
        await user.save();

        await UserItems.create({ userId, itemId: item.id });
        await Transaction.create({
            userId,
            amount: item.price,
            type: "compra",
            productId: item.id,
        });

        return {
            success: true,
            embed: new EmbedBuilder()
                .setColor("#00FF00")
                .setTitle("✅ Compra Exitosa")
                .setDescription(`Has comprado **${item.name}** en la categoría **${category}** por **${item.price}** RockyCoins! 🎉`)
                .setTimestamp(),
        };
    }

    // ⚠️ Handle Item Not Found
    async handleItemNotFound(category, itemName) {
        const categoryExists = await Items.findOne({ where: { category } });

        if (categoryExists) {
            const categoryItems = await Items.findAll({
                where: { category },
                attributes: ["name", "price"],
                raw: true,
            });

            const formattedItems = ListObjectsFormat(categoryItems, "❌ No hay artículos en esta categoría.");

            return {
                success: false,
                embed: alertEmbedList("⚠️ Artículo No Encontrado",
                    `El artículo **${itemName}** no existe en la categoría **${category}**, pero aquí están los artículos disponibles:`,
                    [{
                        name: `📂 Artículos en ${category}`,
                        value: formattedItems,
                    }]
                ),
            };
        }

        const categories = await this.getCategories();
        const formattedCategories = categories.length > 0
            ? `\`\`\`yaml\n${categories.map(c => `- ${c}`).join("\n")}\n\`\`\``
            : "❌ No hay categorías disponibles.";

        return {
            success: false,
            embed: alertEmbedList("❌ Categoría No Encontrada",
                `La categoría **${category}** no existe.`,
                [{ name: "📂 Categorías Disponibles", value: formattedCategories }]
            ),
        };
    }

    // ⚠️ Handle Insufficient Funds
    async handleInsufficientFunds(user, store, item, category) {
        const availableItems = await Items.findAll({
            where: { storeId: store.id, category },
            attributes: ["id", "name", "price"],
            raw: true,
        });

        const userOwnedItems = await UserItems.findAll({
            where: { userId: user.id },
            attributes: ["itemId"],
            raw: true,
        });

        const ownedItemIds = userOwnedItems.map(ui => ui.itemId);
        const affordableItems = availableItems.filter(i =>
            i.price <= user.rockyCoins && !ownedItemIds.includes(i.id)
        );

        const formattedItems = ListObjectsFormat(affordableItems, "❌ No puedes comprar ningún artículo con tu saldo actual.");

        return {
            success: false,
            embed: alertEmbedList("❌ Fondos Insuficientes",
                `Necesitas **${item.price}** RockyCoins para comprar **${item.name}**, pero solo tienes **${user.rockyCoins}**.`,
                [{ value: formattedItems }]
            ),
        };
    }

    // ⚠️ Handle Already Purchased Item
    async handleAlreadyPurchased(userId, store, item, category) {
        const itemsInCategory = await Items.findAll({
            where: { category, storeId: store.id },
            attributes: ["id", "name", "price"],
            raw: true,
        });

        const userOwnedItems = await UserItems.findAll({
            where: { userId },
            attributes: ["itemId"],
            raw: true,
        });

        const ownedItemIds = userOwnedItems.map(ui => ui.itemId);
        const ownedItems = itemsInCategory.filter(i => ownedItemIds.includes(i.id));
        const unownedItems = itemsInCategory.filter(i => !ownedItemIds.includes(i.id));

        return {
            success: false,
            embed: alertEmbedList("⚠️ Artículo Ya Comprado",
                `Ya tienes **${item.name}** en tu inventario.`,
                [
                    { name: "🎭 Otros Accesorios Disponibles", value: ListObjectsFormat(unownedItems) },
                    { name: "🛑 Accesorios que ya posees", value: ListObjectsFormat(ownedItems) },
                ]
            ),
        };
    }
}

const storeInstance = new StoreService();
module.exports = storeInstance;
