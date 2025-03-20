const { Op } = require("sequelize");
const Items = require('../../models/Item/Items');

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
                description: `Un ${category} del tipo ${name}`,
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

    static async getAllItemsByCategory(category, store, attributes = ["id", "name", "price"]) {
        if (!category || !store?.id) {
            console.error("❌ Error: Falta la categoría o el ID de la tienda.");
            return null;
        }

        try {
            const items = await Items.findAll({
                where: { category, storeId: store.id },
                attributes: attributes,
                raw: true
            });

            if (items.length === 0) {
                console.log(`⚠️ Advertencia: No se encontraron ítems en la categoría "${category}" para la tienda con ID ${store.id}`);
                return [];
            }
            return items;
        } catch (error) {
            console.error("❌ Error al obtener los ítems por categoría:", error.message);
            return null;
        }
    }

}

module.exports = ItemService;
