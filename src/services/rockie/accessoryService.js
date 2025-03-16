const { Items } = require("../../models/Item/Items");
const UserItems = require("../../models/Item/UserItems");
const { Users } = require("../../models/User/Users");
const Rockie = require("../../models/Rockie/Rockie");
const storeService = require("../Store/storeService");
const { renderRockie } = require("./rockieService");

// Retrieve all unique accessory categories.
async function getAccessoryCategories() {
    return await Items.findAll({ attributes: ["category"], group: ["category"] });
}

// Retrieve all accessories belonging to a specific category.
async function getAccessoriesByCategory(category) {
    return await Items.findAll({ where: { category } });
}

// Purchase an accessory for Rockie through the store service.
async function buyAccessory(userId, itemName) {
    const result = await storeService.buyItem(userId, itemName);
    return result;
}

// Check if a user owns a specific accessory.
async function userOwnsAccessory(userId, accessoryId) {
    const userItem = await UserItems.findOne({ where: { userId, itemId: accessoryId } });
    return !!userItem;
}

// Equip an accessory on Rockie if owned by the user.
async function equipAccessory(userId, itemName) {
    const accessory = await Items.findOne({ where: { name: itemName } });
    if (!accessory) return { success: false, message: "❌ Accesorio no encontrado." };

    const rockie = await Rockie.findByPk(userId);
    if (!rockie) return { success: false, message: "❌ No tienes un Rockie registrado." };

    // Verify ownership of the accessory.
    const ownsAccessory = await userOwnsAccessory(userId, accessory.id);
    if (!ownsAccessory) {
        return { success: false, message: "❌ No has comprado este accesorio." };
    }

    // Determine and update the accessory type.
    let updateField = null;
    if (accessory.category === "sombrero") updateField = "hatItem";
    if (accessory.category === "ropa") updateField = "clothesItem";
    if (accessory.category === "color") updateField = "color";

    if (!updateField) return { success: false, message: "❌ Este accesorio no se puede equipar." };

    await rockie.update({ [updateField]: accessory.name });

    // Regenerate Rockie's image to reflect the change.
    await renderRockie(userId);

    return { success: true, message: `✅ Has equipado ${accessory.name} en tu Rockie.` };
}

// Update Rockie's attributes and regenerate its image.
async function updateRockieAttributes(userId, updates) {
    const rockie = await Rockie.findByPk(userId);
    if (!rockie) return { success: false, message: "❌ No tienes un Rockie registrado." };

    await rockie.update(updates);
    await renderRockie(userId);

    return { success: true, message: "✅ Atributos de Rockie actualizados correctamente." };
}

module.exports = {
    getAccessoryCategories,
    getAccessoriesByCategory,
    buyAccessory,
    equipAccessory,
    updateRockieAttributes,
};
