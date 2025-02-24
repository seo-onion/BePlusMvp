const Item = require("../../models/Item/Items");

require("dotenv").config();

exports.createBadges = async () => {
    await Item.create({
        name: "RockyCoin",
        description: "Moneda virtual para comprar items.",
        price: 1,
        category: "badge"
    });

    await Item.create({
        name: "RockyGem",
        description: "Moneda virtual para acceder a descuentos y promociones.",
        price: 1,
        category: "badge"
    });
}