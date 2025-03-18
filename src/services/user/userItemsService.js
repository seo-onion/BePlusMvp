const Users = require("../../models/User/Users");
const Items = require("../../models/Item/Items");
const UserItems = require("../../models/Item/UserItems");

class UserItemsService {
    static async createUserItems(item, userId) {
        try {
            if (!item || !userId) {
                console.error("❌ Error: Falta item o userId.");
                return null;
            }

            const user = await Users.findByPk(userId);
            if (!user) {
                console.error(`❌ Error: No se encontró el usuario con ID ${userId}`);
                return null;
            }

            const itemExists = await Items.findByPk(item.id);
            if (!itemExists) {
                console.error(`❌ Error: No se encontró el ítem con ID ${item.id}`);
                return null;
            }

            return await UserItems.create({userId, itemId: item.id});
        } catch (error) {
            console.error("❌ Error al crear UserItems:", error.message);
            return null;
        }
    }
    static async getAllItemsByUser(userId){
        if (!userId) {
            console.error("❌ Error: Falta item o userId.");
            return null;
        }
        try {
            const userItems = await UserItems.findAll({
                where: { userId: userId },
                attributes: ["itemId"], // Only need itemId to compare
                raw: true
            });
            if (userItems.length === 0) {
                console.log(`⚠️ Advertencia: No se encontraron ítems para el usuario con ID ${userId}`);
                return [];
            }
            return userItems;
        } catch (error) {
            console.error("❌ Error al crear UserItems:", error.message);
            return null;
        }
    }
}

module.exports = UserItemsService;
