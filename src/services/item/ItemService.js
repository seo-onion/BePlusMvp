const { Op } = require("sequelize");
const Items = require('../../models/Item/Items');
const UserService = require("../user/userService");
const UserItemsService = require("../user/userItemsService");
const TransactionService = require("../item/transactionServices");

class ItemService {

    // Get a item by ID or Name
    static async getItem(identifier) {
        try {
            return await Items.findOne({
                where: {
                    [Op.or]: [{ id: identifier }, { name: identifier }],
                }
            });
        } catch (error) {
            console.error("Error to get item ", error.message);
            return null;
        }
    }

    // Get All Items
    static async getAllItems() {
        try {
            return await Items.findAll();
        } catch (error) {
            console.error("Error to get items", error.message);
            return null;
        }
    }


    // Create an Item
    static async createItem(req) {
        try {

            const { name, price, category, storeId } = req;
            if (!name || !price || !category || storeId ) {
                console.error("Required data is missing to create the item.")
                return null 
            }

            return await Items.create({
                name,
                description: `Un ${category} del tipo ${name}`, //TODO: Do description a parameter
                price,
                category,
                storeId,
                badge: "coin",
            });
        } catch (error) {
            console.error("Error creating item:", error.message);
            return null;
        }
    }

    // Update an Item
    static async updateItem(req) {
        try {

            const { identifier, ...updateFields } = req;
            
            if (!identifier || Object.keys(updateFields).length === 0) {
                console.error("Error: An identifier and at least one field are required to update.");
                return null;
            }

            const item = await this.getItem(identifier);

            if (!item) {
                console.error(`Item with ID or Name: ${identifier} not found`);
                return null;
            }

            // Update fields
            await item.update(updateFields);

            return item;

        } catch (error) {
            console.error("Error updating item:", error.message);
            return null;
        }
    }

    // Delete an Item
    static async deleteItem(req) {
        const {identifier, interaction, category, itemName} = req
        try {

            const item = await this.getItem(identifier);
            if (!item) {
                console.error(`Item not found`);
                return null;
            }

            await item.destroy();
            return item;

        } catch (error) {
            console.error("Error deleting item:", error.message);
            return null;
        }
    }

    static async getAllItemsByCategory(category, attributes = ["id", "name", "price"]) {
        if (!category) {
            console.error("❌ Error: Falta la categoría o el ID de la tienda.");
            return null;
        }

        try {
            const items = await Items.findAll({
                where: { category },
                attributes: attributes,
                raw: true
            });

            if (items.length === 0) {
                console.log(`Advertencia: No se encontraron ítems en la categoría "${category}"`);
                return [];
            }
            return items;
        } catch (error) {
            console.error("❌ Error al obtener los ítems por categoría:", error.message);
            return null;
        }
    }

    static async getItemByCategoryAndName(req) {
        
        const {category, name} = req;
        
        if (!category || !name) {
            console.error("Error: Both category and name are required.");
            return null;
        }
        try {
            const where = {
                category,
                name,
            };
    
            const item = await Items.findOne({ where });
    
            if (!item) {
                console.log(`Item "${name}" not found in category "${category}"`);
                return null;
            }
    
            return item;
    
        } catch (error) {
            console.error("Error getting item by category and name:", error.message);
            return null;
        }
    }

    static async buyItem(req) {
        const {userId, itemName, category} = req
        try {
            const item = await this.getItemByCategoryAndName({ category, name: itemName});
    
            if (!item) return null;
    
            const user = await UserService.getUser(userId);
            if (!user) return null;
    
            if (user.rockyCoins < item.price) return null;
    
            const existingPurchase = await UserItemsService.hasUserItem({ userId, itemId: item.id });
            if (existingPurchase) return null;
    
            user.rockyCoins -= item.price;
            await user.save();
    
            await UserItemsService.createUserItems(item, userId);
            await TransactionService.createTransaction({
                userId,
                amount: item.price,
                type: "compra",
                badge: "rockyCoin",
                productId: item.id
            });
    
            return item;
    
        } catch (error) {
            console.error("Error in buyItem:", error.message);
            return null;
        }
    }
    
}

module.exports = ItemService;
