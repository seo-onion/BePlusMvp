const { EmbedBuilder } = require("discord.js");
const Items = require("../../models/Item/Items");
const Store = require("../../models/Store/Store");
const User = require("../../models/User/Users");
const UserItems = require("../../models/Item/UserItems");
const Transaction = require("../../models/Item/Transaction");

class StoreManager {
    constructor() {
        if (!StoreManager.instance) {
            StoreManager.instance = this;
            this.store = null; // 🔹 Cache for store instance
        }
        return StoreManager.instance;
    }

    // 📌 Fetch the store (creates it if not exists)
    async getStore() {
        if (this.store) return this.store;

        let store = await Store.findOne();
        if (!store) store = await Store.create({ name: "Rocky Store" });

        this.store = store;
        return store;
    }

    // 📌 Get all unique categories from Items
    async getCategories() {
        try {
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

    // 📌 Get all items from the store
    async getItems() {
        const store = await this.getStore();
        return await Items.findAll({ where: { storeId: store.id } });
    }

    // 📌 Get items by specific category
    async getItemsByCategory(category) {
        const store = await this.getStore();
        return await Items.findAll({ where: { category, storeId: store.id } });
    }

    // 📌 Get single item by name and category
    async getItemByCategoryAndName(category, itemName) {
        const store = await this.getStore();
        return await Items.findOne({
            where: { name: itemName, category, storeId: store.id }
        });
    }

    // 📌 Main function: purchase item by user
    async buyItem(userId, itemName, category) {
        const store = await this.getStore();

        const item = await Items.findOne({
            where: { name: itemName, storeId: store.id, category }
        });

        // 📌 Item not found → validate category
        if (!item) {
            const categoryExists = await Items.findOne({ where: { category }, raw: true });

            if (categoryExists) {
                const categoryItems = await Items.findAll({
                    where: { category },
                    attributes: ["name", "price"],
                    raw: true
                });

                const formattedItems = categoryItems.length > 0
                    ? `\`\`\`css\n${categoryItems.map(i => `• ${i.name.padEnd(10)} ${i.price} 🪙`).join("\n")}\n\`\`\``
                    : "❌ No hay artículos en esta categoría.";

                return {
                    success: false,
                    embed: new EmbedBuilder()
                        .setColor("#FFA500")
                        .setTitle("⚠️ Artículo No Encontrado")
                        .setDescription(`El artículo **${itemName}** no existe en la categoría **${category}**, pero aquí están los disponibles:`)
                        .addFields({ name: `📂 Artículos en ${category}`, value: formattedItems })
                        .setFooter({ text: "Tienda Rocky • Verifica el nombre del artículo." })
                        .setTimestamp()
                };
            } else {
                const categories = await this.getCategories();

                const formattedCategories = categories.length > 0
                    ? `\`\`\`yaml\n${categories.map(c => `- ${c}`).join("\n")}\n\`\`\``
                    : "❌ No hay categorías disponibles.";

                return {
                    success: false,
                    embed: new EmbedBuilder()
                        .setColor("#FF0000")
                        .setTitle("❌ Categoría No Encontrada")
                        .setDescription(`La categoría **${category}** no existe.`)
                        .addFields({ name: "📂 Categorías Disponibles", value: formattedCategories })
                        .setFooter({ text: "Tienda Rocky • Prueba otra categoría." })
                        .setTimestamp()
                };
            }
        }

        // 📌 Validate user
        const user = await User.findByPk(userId);
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

        // 📌 Validate coins
        if (user.rockyCoins < item.price) {
            const allStoreItems = await Items.findAll({
                where: { storeId: store.id, category },
                attributes: ["id", "name", "price"],
                raw: true
            });

            const userOwnedItems = await UserItems.findAll({
                where: { userId },
                attributes: ["itemId"],
                raw: true
            });

            const ownedItemIds = userOwnedItems.map(ui => ui.itemId);
            const affordableItems = allStoreItems.filter(i =>
                i.price <= user.rockyCoins && !ownedItemIds.includes(i.id)
            );

            const formattedAffordableItems = affordableItems.length > 0
                ? `\`\`\`css\n${affordableItems.map(i => `• ${i.name.padEnd(10)} ${i.price} 🪙`).join("\n")}\n\`\`\``
                : "❌ No puedes comprar ningún artículo con tu saldo actual.";

            return {
                success: false,
                embed: new EmbedBuilder()
                    .setColor("#FFA500")
                    .setTitle("❌ Fondos Insuficientes")
                    .setDescription(`Necesitas **${item.price}** RockyCoins para comprar **${itemName}**.  
Actualmente tienes **${user.rockyCoins}** RockyCoins. Te faltan **${item.price - user.rockyCoins}** RockyCoins.`)
                    .addFields({ name: "🛒 Artículos que puedes comprar", value: formattedAffordableItems })
                    .setFooter({ text: "Tienda Rocky • ¡Ahorra más para comprar este artículo!" })
                    .setTimestamp()
            };
        }

        // 📌 Validate duplicate purchase
        const existingPurchase = await UserItems.findOne({ where: { userId, itemId: item.id } });
        if (existingPurchase) {
            const otherItems = await Items.findAll({
                where: { category, storeId: store.id },
                attributes: ["id", "name", "price"],
                raw: true
            });

            const userOwnedItems = await UserItems.findAll({
                where: { userId },
                attributes: ["itemId"],
                raw: true
            });

            const ownedItemIds = userOwnedItems.map(ui => ui.itemId);
            const ownedItems = otherItems.filter(i => ownedItemIds.includes(i.id));
            const unownedItems = otherItems.filter(i => !ownedItemIds.includes(i.id));

            const padEndNumber = 15;

            const formattedUnownedItems = unownedItems.length > 0
                ? `\`\`\`css\n${unownedItems.map(i => `• ${i.name.padEnd(padEndNumber)} ${i.price} 🪙`).join("\n")}\n\`\`\``
                : "❌ No hay otros accesorios disponibles en esta categoría.";

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

        // 📌 Execute purchase
        user.rockyCoins -= item.price;
        await user.save();

        await UserItems.create({ userId, itemId: item.id });

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
                .setDescription(`Has comprado de la categoría **${item.category}** el item **${item.name}** por **${item.price}** RockyCoins! 🎉`)
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

