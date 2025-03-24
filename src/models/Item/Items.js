// 📌 src/models/Item/Items.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

/**
 * Represents an item in the Rockie store.
 * Can be equipped as clothing, accessory, or change Rockie's color.
 * Each item has an optional image reference stored in S3.
 */
const Items = sequelize.define("Items", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    badge: {
        type: DataTypes.ENUM("coin", "gem"),
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // 📌 URL of the item's image in AWS S3 (optional, used for rendering)
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: "Items",
    timestamps: false
});

module.exports = Items;

