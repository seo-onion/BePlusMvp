const { Items } = require( "../Item/Items.js");
const itemsData = require ("../../services/Store/storeItems.json"); // Carga el json y lo pone como Items
const { Store } = require("./Store.js")
const { Op } = require("sequelize");

const dictionaryItemsFromCategory = {};
console.log("here")
async function loadItems() {
    try {
        console.log("here");
        // Creacion del store, y se le pone el nombre Rocky Store
        let store = await Store.findOne();
        if (!store) {
            store = await Store.create({ name: "Rocky Store" });
            console.log("✅ Tienda creada.");
        }

        // recorre el .json por cada categoria
        for (const category in itemsData) {
            for (const [name, price] of Object.entries(itemsData[category])) {
                if (!dictionaryItemsFromCategory[category]) {
                    dictionaryItemsFromCategory[category] = [];
                }
                dictionaryItemsFromCategory[category].push({ name, price });

                await Items.create({
                    name,
                    description: `Un ${category} del tipo ${name}`,
                    price,
                    category,
                    storeId: store.id
                    });
                console.log(`✅ Category: ${category} | Added Item: ${name} |  | Price: ${price}`);

            }
        }
        console.log("✅ Items anadidos correctamente.");
        console.log(dictionaryItemsFromCategory);
    } catch (error) {
        console.error("❌ Error cargando los items:", error);
    }
}
loadItems();
module.exports = { loadItems, dictionaryItemsFromCategory };

