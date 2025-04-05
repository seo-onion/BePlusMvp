const Users = require("../../models/User/Users");
const Items = require("../../models/Item/Items");
const UserItems = require("../../models/Item/UserItems");

class UserItemsService {
    static async createUserItems(item, userId) {
        try {
            if (!item || !userId) {
                console.error("Missing item or userId.");
                return null;
            }

            const user = await Users.findByPk(userId);
            if (!user) {
                console.error(`User not found ${userId}`);
                return null;
            }

            const itemExists = await Items.findByPk(item.id);
            if (!itemExists) {
                console.error(`Item not found ${item.id}`);
                return null;
            }

            return await UserItems.create({userId, itemId: item.id});
        } catch (error) {
            console.error("Error to create UserItems:", error.message);
            return null;
        }
    }
    static async getAllItemsByUser(userId){
        if (!userId) {
            console.error("Error: Falta item o userId.");
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

    static async hasUserItem(req) {

        const {userId, itemId} = req;
        try {
            const result = await UserItems.findOne({ where: { userId, itemId } });
            return !!result;
        } catch (error) {
            console.error("Error checking user item existence:", error.message);
            return false;
        }
    }
}

module.exports = UserItemsService;
