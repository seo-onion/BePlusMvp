const { Items } = require("../Item/Items.js");
const itemsData = require("../../services/Store/storeItems.json"); // Load your JSON
const { Store } = require("../../models/Store/Store")

async function loadItems() {
    try {
        let store = await Store.findOne();
        if (!store) {
            store = await Store.create({ name: "Rocky Store" });
            console.log("✅ Tienda creada.");
        }

        // recorre el .json por cada categoria
        for (const category in itemsData) {
            for (const [name, price] of Object.entries(itemsData[category])) {

                // Creacion de los items con el storeItems.json
                await Items.create({
                    name,
                    description: ` Un ${category} del tipo ${name}`,
                    price,
                    category,
                    storeId: store.id
                });
            }
        }
        console.log("✅ Items anadidos correctamente.");
    } catch (error) {
        console.error("❌ Error cargando los items:", error);
    }
}

loadItems();

