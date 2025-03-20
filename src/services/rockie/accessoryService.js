// 📌 src/services/rockie/accessoryService.js
const Items = require("../../models/Item/Items");
const UserItems = require("../../models/Item/UserItems");
const Rockie = require("../../models/Rockie/Rockie");
const storeService = require("../Store/storeService");
const renderRockieService = require("./renderRockieService");
const s3Service = require("../aws/s3Service"); // ✅ Validación en S3

/**
 * Handles logic for Rockie accessories: purchase, equip, update.
 */
class AccessoryService {
    /**
     * Gets all unique accessory categories in the store.
     * @returns {Promise<string[]>}
     */
    async getAccessoryCategories() {
        const categories = await Items.findAll({
            attributes: ["category"],
            group: ["category"],
            raw: true
        });
        return categories.map(cat => cat.category);
    }

    /**
     * Gets all accessories within a specific category.
     * @param {string} category 
     * @returns {Promise<Items[]>}
     */
    async getAccessoriesByCategory(category) {
        return await Items.findAll({ where: { category } });
    }

    /**
     * Buys an accessory for the user using storeService.
     * @param {string} userId - Discord user ID.
     * @param {string} itemName - Item name.
     * @returns {Promise<Object>} Store response.
     */
    async buyAccessory(userId, itemName) {
        return await storeService.buyItem(userId, itemName);
    }

    /**
     * Checks if the user owns a specific accessory.
     * @param {string} userId 
     * @param {string} accessoryId 
     * @returns {Promise<boolean>}
     */
    async userOwnsAccessory(userId, accessoryId) {
        const userItem = await UserItems.findOne({ where: { userId, itemId: accessoryId } });
        return !!userItem;
    }

    /**
     * Validates if a file exists in a given S3 folder.
     * @param {string} fileName - Name of the file.
     * @param {string} folder - Folder path in S3.
     * @returns {Promise<boolean>}
     */
    async fileExistsInS3(fileName, folder) {
        const files = await s3Service.listFilesInS3(folder);
        return files.includes(fileName);
    }

    /**
     * Equips an accessory (if valid) on Rockie and triggers render.
     * Validates image existence in S3 before equipping.
     * @param {string} userId 
     * @param {string} itemName 
     * @returns {Promise<Object>} Result message.
     */
    async equipAccessory(userId, itemName) {
        const accessory = await Items.findOne({ where: { name: itemName } });
        if (!accessory) return { success: false, message: "❌ Accesorio no encontrado." };

        const rockie = await Rockie.findByPk(userId);
        if (!rockie) return { success: false, message: "❌ No tienes un Rockie registrado." };

        const owns = await this.userOwnsAccessory(userId, accessory.id);
        if (!owns) return { success: false, message: "❌ No has comprado este accesorio." };

        let updateField = null;
        let s3Folder = null;

        switch (accessory.category) {
            case "sombrero":
                updateField = "hatItem";
                s3Folder = "sombreros/";
                break;
            case "ropa":
                updateField = "clothesItem";
                s3Folder = "ropas/";
                break;
            case "color":
                updateField = "color";
                // 🟡 No se valida color porque se usa como subcarpeta (bases/color/...)
                break;
            default:
                return { success: false, message: "❌ Este accesorio no se puede equipar." };
        }

        // ✅ Validate existence in S3 (for hat/ropa only)
        if (s3Folder) {
            const exists = await this.fileExistsInS3(itemName, s3Folder);
            if (!exists) {
                return {
                    success: false,
                    message: `❌ La imagen **${itemName}** no existe en S3 en la carpeta **${s3Folder}**. No se puede equipar.`
                };
            }
        }

        await rockie.update({ [updateField]: itemName });
        await renderRockieService.renderRockie(userId);

        return { success: true, message: `✅ Has equipado **${itemName}** en tu Rockie.` };
    }

    /**
     * Updates Rockie attributes and re-renders the image.
     * @param {string} userId 
     * @param {Object} updates 
     * @returns {Promise<Object>} Update result.
     */
    async updateRockieAttributes(userId, updates) {
        const rockie = await Rockie.findByPk(userId);
        if (!rockie) return { success: false, message: "❌ No tienes un Rockie registrado." };

        await rockie.update(updates);
        await renderRockieService.renderRockie(userId);

        return { success: true, message: "✅ Atributos de Rockie actualizados correctamente." };
    }
  /**
   * Obtiene todos los accesorios que el usuario ha comprado con detalles del ítem.
   * @param {string} userId
   * @returns {Promise<Array>} Lista de objetos { name, category, price }
   */
  async getUserItemsWithDetails(userId) {
    const userItems = await UserItems.findAll({
      where: { userId },
      include: [{ model: Items, as: 'Item', attributes: ['name', 'category', 'price'] }],
      raw: true,
      nest: true,
    });


    // Mapear a un formato sencillo
    return userItems.map((ui) => ({
      name: ui.Item.name,
      category: ui.Item.category,
      price: ui.Item.price,
    }));
  }
}

// 📌 Singleton Export
module.exports = new AccessoryService();
