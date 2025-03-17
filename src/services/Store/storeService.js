const Items = require("../../models/Item/Items");
const Store = require("../../models/Store/Store");
const User = require("../../models/User/Users.js");
const UserItems = require("../../models/Item/UserItems");
const Transaction = require("../../models/Item/Transaction");
const { EmbedBuilder } = require("discord.js");

class StoreManager {
    // It uses Singleton to create a single Store
    constructor() {
        if (!StoreManager.instance) {
            StoreManager.instance = this;
            this.store = null;
        }
        return StoreManager.instance;
    }

    // ✅ Get or create the store once (caching mechanism)
    async getStore() {
        // ✅ Return cached store if available
        if (this.store) return this.store;

        // Finds or creates a Store
        let store = await Store.findOne();
        if (!store) {
            store = await Store.create({ name: "Rocky Store" });
        }

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
            })
            return categories.map(cat => cat.category) || [];
        } catch(error){
            console.log("❌ Error fetching categories from database:", error);
            return [];
        }
    }

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
    async buyItem(userId, itemName, category) {
        // Gets the Store
        const store = await this.getStore();

        // Finds the Item by the category and the name set by the User
        const item = await Items.findOne({
            where: { name: itemName, storeId: store.id, category: category }
        });
        console.log("🛒 Item encontrado en DB:", item ? item.dataValues : "❌ No encontrado");

        // ✅ Check if the category of the Item exists
        if (!item) {
            const categoryExists = await Items.findOne({
                where: { category },
                raw: true
            });

            // ✅ If the category exists it Fetch all items in the category
            if (categoryExists) {
                const categoryItems = await Items.findAll({
                    where: { category },
                    attributes: ["name", "price"],
                    raw: true
                });

                // ✅ Format category items as a list
                const formattedCategoryItems = categoryItems.length > 0
                    ? `\`\`\`css\n${categoryItems.map(i => `• ${i.name.padEnd(10)} ${i.price} 🪙`).join("\n")}\n\`\`\``
                    : "❌ No hay artículos en esta categoría.";

                return {
                    success: false,
                    embed: new EmbedBuilder()
                        .setColor("#FFA500") // 🟠 Warning color
                        .setTitle("⚠️ Artículo No Encontrado")
                        .setDescription(`El artículo **${itemName}** no existe en la categoría **${category}**, pero aquí \n
                                        están los artículos disponibles en esa categoría:`)
                        .addFields({
                            name: `📂 Artículos en ${category}`,
                            value: formattedCategoryItems
                        })
                        .setFooter({ text: "Tienda Rocky • Verifica el nombre del artículo." })
                        .setTimestamp()
                };
            } else {
                // If the category does not exist Fetch all available categories
                const categories = await this.getCategories();

                // ✅ Format categories as a list
                const formattedCategories = categories.length > 0
                    ? `\`\`\`yaml\n${categories.map(c => `- ${c}`).join("\n")}\n\`\`\``
                    : "❌ No hay categorías disponibles.";

                return {
                    success: false,
                    embed: new EmbedBuilder()
                        .setColor("#FF0000") // 🔴 Error color
                        .setTitle("❌ Categoría No Encontrada")
                        .setDescription(`La categoría **${category}** no existe.`)
                        .addFields({
                            name: "📂 Categorías Disponibles",
                            value: formattedCategories
                        })
                        .setFooter({ text: "Tienda Rocky • Prueba otra categoría." })
                        .setTimestamp()
                };
            }
        }

        console.log("✅ Item encontrado:", item.name);

        const user = await User.findByPk(userId);

        // If the User doesn't exist return an error message
        if (!user) {
            return {
                success: false,
                embed: new EmbedBuilder()
                    .setColor("#FF0000")
                    .setTitle("❌ Usuario No Encontrado")
                    .setDescription("No se pudo encontrar tu perfil en la base de datos.")
                    .setFooter({ text: "Tienda Rocky • Contacta a un administrador si el problema persiste." })
                    .setTimestamp()
            };
        }

        console.log(`🔹 Usuario tiene ${user.rockyCoins} RockyCoins.`);
        console.log(`🔹 El precio del item es ${item.price} RockyCoins.`);

        // If the price of the Item is greater than the User's RockyCoins
        if (user.rockyCoins < item.price) {
            // ✅ Fetch all available store items
            const allStoreItems = await Items.findAll({
                where: { storeId: store.id , category},
                attributes: ["id", "name", "price"],
                raw: true
            });

            // ✅ Get all items the user owns
            const userOwnedItems = await UserItems.findAll({
                where: { userId: userId },
                attributes: ["itemId"],
                raw: true
            });

            // ✅ Convert owned items into an array of IDs
            const ownedItemIds = userOwnedItems.map(ui => ui.itemId);

            // ✅ Filter only items the user can afford AND doesn't own
            const affordableUnownedItems = allStoreItems.filter(i =>
                i.price <= user.rockyCoins && !ownedItemIds.includes(i.id)
            );

            // ✅ Format the list
            const formattedAffordableItems = affordableUnownedItems.length > 0
                ? `\`\`\`css\n${affordableUnownedItems.map(i => `• ${i.name.padEnd(10)} ${i.price} 🪙`).join("\n")}\n\`\`\``
                : "❌ No puedes comprar ningún artículo con tu saldo actual.";


            return {
                success: false,
                embed: new EmbedBuilder()
                    .setColor("#FFA500")
                    .setTitle("❌ Fondos Insuficientes")
                    .setDescription(`Necesitas **${item.price}** RockyCoins para comprar **${itemName}**.  
                        Actualmente tienes **${user.rockyCoins}** RockyCoins.  
                        Te faltan **${item.price - user.rockyCoins}** RockyCoins.`)
                    .addFields({
                        name: "🛒 Artículos que puedes comprar",
                        value: formattedAffordableItems
                    })
                    .setFooter({ text: "Tienda Rocky • ¡Ahorra más para comprar este artículo!" })
                    .setTimestamp()
            };
        }

        // Finds all the items that the User has
        const existingPurchase = await UserItems.findOne({ where: { userId, itemId: item.id } });

        // If the user has Items
        if (existingPurchase) {
            // ✅ Fetch all items in the same category
            const otherItems = await Items.findAll({
                where: { category: category, storeId: store.id },
                attributes: ["id", "name", "price"],
                raw: true
            });
            // 🔹 Get all items the user owns
            const userOwnedItems = await UserItems.findAll({
                where: { userId: userId },
                attributes: ["itemId"], // ✅ Only need itemId to compare
                raw: true
            });
            // 🔹 Convert owned items into an array of IDs
            const ownedItemIds = userOwnedItems.map(ui => ui.itemId);
            console.log("🔍 IDs de artículos que posee el usuario:", ownedItemIds);

            // 🔹 Separate owned and unowned items
            const ownedItems = otherItems.filter(i => ownedItemIds.includes(i.id));
            const unownedItems = otherItems.filter(i => !ownedItemIds.includes(i.id));

            console.log("✅ Artículos disponibles para sugerir:", unownedItems);
            console.log("✅ Artículos ya comprados:", ownedItems);

            const padEndNumber = 15;

            // ✅ Format the available items
            const formattedUnownedItems = unownedItems.length > 0
                ? `\`\`\`css\n${unownedItems.map(i => `• ${i.name.padEnd(padEndNumber)} ${i.price} 🪙`).join("\n")}\n\`\`\``
                : "❌ No hay otros accesorios disponibles en esta categoría.\n" +
                "Seguramente ya hayas comprado todos los items disponibles.";

            // ✅ Format the owned items
            const formattedOwnedItems = ownedItems.length > 0
                ? `\`\`\`css\n${ownedItems.map(i => `• ${i.name.padEnd(padEndNumber)} ${i.price} 🪙`).join("\n")}\n\`\`\``
                : "No tienes otros accesorios en esta categoría.";

            return {
                success: false,
                embed: new EmbedBuilder()
                    .setColor("#FFFF00")
                    .setTitle("⚠️ Artículo Ya Comprado")
                    .setDescription(`Ya tienes **${item.name}** en tu inventario.`)
                    .addFields(
                        { name: "🎭 Otros Accesorios Disponibles", value: formattedUnownedItems },
                        { name: "🛑 Accesorios que ya posees", value: formattedOwnedItems }
                    )
                    .setFooter({ text: "Tienda Rocky • No puedes comprarlo dos veces." })
                    .setTimestamp()
            };
        }
        // It uploads the rockyCoins of the User and saves it in the DB
        user.rockyCoins -= item.price;
        await user.save();

        // Creates a relation UserItems (The User has one more item)
        await UserItems.create({ userId, itemId: item.id });

        // Creates a Transaction withe ProductID and the price of the product
        await Transaction.create({
            userId,
            amount: item.price,
            type: "compra",
            productId: item.id
        });

        return {
            success: true,
            embed: new EmbedBuilder()
                .setColor("#00FF00")
                .setTitle("✅ Compra Exitosa")
                .setDescription(`Has comprado de la categoría **${item.category}** el item **${item.name}** \n por **${item.price}** RockyCoins! 🎉`)
                .addFields(
                    { name: "🔠 Categoría", value: `**${category}**`, inline: true },
                    { name: "🛒 Artículo", value: `**${itemName}**`, inline: true },
                    { name: "💰 Precio", value: `**${item.price}** RockyCoins`, inline: true },

                )
                .setFooter({ text: "Tienda Rocky • ¡Gracias por tu compra!" })
                .setTimestamp()
        };
    }
}

const storeInstance = new StoreManager();
module.exports = storeInstance;
