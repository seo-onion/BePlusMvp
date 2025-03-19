const { EmbedBuilder } = require("discord.js");
const Items = require("../../models/Item/Items");
const Store = require("../../models/Store/Store");
const User = require("../../models/User/Users");
const UserItems = require("../../models/Item/UserItems");
const createErrorEmbed = require("../../utils/embed/errorEmbed");
const alertEmbedList = require("../../utils/embed/alertEmbedList");
const ListObjectsFormat = require("../../utils/ListObjects");
const successEmbed = require("../../utils/embed/successEmbed");
const EconomyService = require("../../services/item/economyService.js");
const userItemsService = require("../../services/user/userItemsService");
const ItemService = require("../../services/item/ItemService");

class StoreManager {
    // It uses Singleton to create a single Store
    /*
    constructor() {
        if (!StoreManager.instance) {
            StoreManager.instance = this;
<<<<<<< HEAD
            this.store = null;
=======
            this.store = null; // 🔹 Cache for store instance
>>>>>>> origin/feature/aws-rockie-integracion
        }
        return StoreManager.instance;
    }*/

    // Get or create the store once (caching mechanism)
    async getStore() {
        // Return cached store if available
        if (this.store) return this.store;

        // Finds or creates a Store
        let store = await Store.findOne();
        if (!store) store = await Store.create({ name: "Rocky Store" });

        this.store = store;
        return store;
    }

    async getCategories(){
        // Tries to return all the categories from the Items Table
        try{
            const categories = await Items.findAll({
                attributes: ['category'],
                group: ['category'],
                raw: true
            });
            return categories.map(cat => cat.category) || [];
        } catch (error) {
            console.error("❌ Error al obtener categorías:", error);
            return [];
        }
    }

    // Get all items
    async getItems() {
        const store = await this.getStore();
        return await Items.findAll({ where: { storeId: store.id } });
    }

    // Get items by category
    async getItemsByCategory(category) {
        const store = await this.getStore();
        return await Items.findAll({ where: { category, storeId: store.id } });
    }

    // Get a single item by category and name
    async getItemByCategoryAndName(category, itemName) {
        const store = await this.getStore();
        return await Items.findOne({
            where: {
                category: category, // `category` is already a string
                storeId: store.id, // No need to convert `storeId`
                name: itemName
            }
        });
    }

    // Buy an item with RockyCoins
    async buyItem(userId, itemName, category) {
        // Gets the Store
        const store = await this.getStore();

        // Finds the Item by the category and the name set by the User
        const item = await this.getItemByCategoryAndName(category,itemName);
        console.log("🛒 Item encontrado en DB:", item ? item.dataValues : "❌ No encontrado");

        // Check if the category of the Item exists
        if (!item) {
            const categoryExists = await Items.findOne({
                where: { category },
                raw: true
            });

            // If the category exists it Fetch all items in the category
            if (categoryExists) {
                const categoryItems = await ItemService.getAllItemsByCategory(category,store,["name", "price"]) || [];

                return {
                    success: false,
                    embed: alertEmbedList("⚠️ Artículo No Encontrado",
                        `El artículo **${itemName}** no existe en la categoría **${category}**, pero aquí \n
                                        están los artículos disponibles en esa categoría:`,
                        [{
                            name: `📂 Artículos en ${category}`,
                            value: ListObjectsFormat(categoryItems,"❌ No hay artículos en esta categoría."),
                        }]
                    ),
                };
            } else {
                // If the category does not exist Fetch all available categories
                const categories = await this.getCategories();

                // Format categories as a list
                const formattedCategories = categories.length > 0
                    ? `\`\`\`yaml\n${categories.map(c => `- ${c}`).join("\n")}\n\`\`\``
                    : "❌ No hay categorías disponibles.";

                return {
                    success: false,
                    embed: alertEmbedList(
                        "❌ Categoría No Encontrada",
                        `La categoría **${category}** no existe.`,
                        [{
                            name: "📂 Categorías Disponibles",
                            value: formattedCategories,
                        }]
                    ),
                };
            }
        }

        console.log("Item encontrado:", item.name);

        const user = await User.findByPk(userId);

        // If the User doesn't exist return an error message
        if (!user) {
            return {
                success: false,
                embed: createErrorEmbed({
                    title: "❌ Usuario No Encontrado. No se pudo encontrar tu perfil en la base de datos.",
                }),
            };
        }

        console.log(`🔹 Usuario tiene ${user.rockyCoins} RockyCoins.`);
        console.log(`🔹 El precio del item es ${item.price} RockyCoins.`);

        // If the price of the Item is greater than the User's RockyCoins
        if (user.rockyCoins < item.price) {
            // Fetch all available store items
            const allStoreItems = await ItemService.getAllItemsByCategory(category,store);

            // 🔹 Get all items the user owns
            const userOwnedItems = await userItemsService.getAllItemsByUser(userId);

            // Convert owned items into an array of IDs
            const ownedItemIds = userOwnedItems.map(ui => ui.itemId);

            // Filter only items the user can afford AND doesn't own
            const affordableUnownedItems = allStoreItems.filter(i =>
                i.price <= user.rockyCoins && !ownedItemIds.includes(i.id)
            );

            return {
                success: false,
                embed: alertEmbedList(
                    "❌ Fondos Insuficientes",
                    `Necesitas **${item.price}** RockyCoins para comprar **${itemName}**.  
                        Actualmente tienes **${user.rockyCoins}** RockyCoins.  
                        Te faltan **${item.price - user.rockyCoins}** RockyCoins.`,
                    [
                        {
                            name: " 🎭 Pero puedes comprar estos items",
                            value: ListObjectsFormat(affordableUnownedItems, "❌ No puedes comprar ningún artículo con tu saldo actual.")
                        }
                    ]),
            };
        }

        // Finds all the items that the User has
        const existingPurchase = await UserItems.findOne({ where: { userId, itemId: item.id } });

        // If the user has Items
        if (existingPurchase) {
            // Fetch all items in the same category
            const otherItems = await ItemService.getAllItemsByCategory(category,store);

            // 🔹 Get all items the user owns
            const userOwnedItems = await userItemsService.getAllItemsByUser(userId);

            // 🔹 Convert owned items into an array of IDs
            const ownedItemIds = userOwnedItems.map(ui => ui.itemId);
            console.log("🔍 IDs de artículos que posee el usuario:", ownedItemIds);

            const ownedItemIds = userOwnedItems.map(ui => ui.itemId);
            const ownedItems = otherItems.filter(i => ownedItemIds.includes(i.id));
            const unownedItems = otherItems.filter(i => !ownedItemIds.includes(i.id));

            console.log("Artículos disponibles para sugerir:", unownedItems);
            console.log("Artículos ya comprados:", ownedItems);

            return {
                success: false,
                embed: alertEmbedList("⚠️ Artículo Ya Comprado",
                    `Ya tienes **${item.name}** en tu inventario.`,
                    [
                        {
                            name: "🎭 Otros Accesorios Disponibles",
                            value: ListObjectsFormat(
                                unownedItems, "❌ No hay otros accesorios disponibles en esta categoría.\n" +
                                "Seguramente ya hayas comprado todos los items disponibles."),
                            inline: true
                        },
                        {
                            name: "🛑 Accesorios que ya posees",
                            value: ListObjectsFormat(ownedItems,"No tienes otros accesorios en esta categoría."),
                            inline: true
                        }
                    ]
                ),
            };
        }
        // It uploads the rockyCoins of the User and saves it in the DB
        user.rockyCoins -= item.price;
        await user.save();

        // Creates a relation UserItems (The User has one more item)
        await userItemsService.createUserItems(userId,item.id);

        // Creates a Transaction withe ProductID and the price of the product
        await EconomyService.createTransaction(userId, item.price, "compra", item.id);

        return {
            success: true,
            embed: successEmbed({
                item,
                category: item.category,
                itemName: item.name,
            }),
        };
    }
}

const storeInstance = new StoreManager();
module.exports = storeInstance;
