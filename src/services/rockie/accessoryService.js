const { Items } = require("../../models/Item/Items");
const  UserItems  = require("../../models/Item/UserItems");
const { Users } = require("../../models/User/Users");
const Rockie = require("../../models/Rockie/Rockie");
const storeService = require("../Store/storeService");
const { renderRockie } = require("./rockieService");

// 📌 Obtener todas las categorías de accesorios disponibles
async function getAccessoryCategories() {
    return await Items.findAll({ attributes: ["category"], group: ["category"] });
}

// 📌 Obtener todos los accesorios de una categoría específica
async function getAccessoriesByCategory(category) {
    return await Items.findAll({ where: { category } });
}

// 📌 Comprar un accesorio para Rockie
async function buyAccessory(userId, itemName) {
    const result = await storeService.buyItem(userId, itemName);
    return result;
}

// 📌 Verificar si un usuario tiene un accesorio específico
async function userOwnsAccessory(userId, accessoryId) {
    const userItem = await UserItems.findOne({ where: { userId, itemId: accessoryId } });
    return !!userItem;
}

// 📌 Equipar un accesorio en Rockie
async function equipAccessory(userId, itemName) {
    const accessory = await Items.findOne({ where: { name: itemName } });
    if (!accessory) return { success: false, message: "❌ Accesorio no encontrado." };

    const rockie = await Rockie.findByPk(userId);
    if (!rockie) return { success: false, message: "❌ No tienes un Rockie registrado." };

    // 📌 Verificar que el usuario haya comprado el accesorio
    const ownsAccessory = await userOwnsAccessory(userId, accessory.id);
    if (!ownsAccessory) {
        return { success: false, message: "❌ No has comprado este accesorio." };
    }

    // 📌 Determinar el tipo de accesorio y asignarlo al Rockie
    let updateField = null;
    if (accessory.category === "sombrero") updateField = "hatItem";
    if (accessory.category === "ropa") updateField = "clothesItem";
    if (accessory.category === "color") updateField = "color"; // Si se permite cambiar el color con un item

    if (!updateField) return { success: false, message: "❌ Este accesorio no se puede equipar." };

    await rockie.update({ [updateField]: accessory.name });

    // 📌 Regenerar la imagen de Rockie
    await renderRockie(userId);

    return { success: true, message: `✅ Has equipado ${accessory.name} en tu Rockie.` };
}

// 📌 Editar atributos de Rockie (PUT/PATCH)
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

