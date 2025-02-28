const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const Items = sequelize.define("Items", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.STRING
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    badge: {
        type: DataTypes.ENUM('coin', 'gem'),
        allowNull: true
    },
    category: {
        type: DataTypes.ENUM("clothes", "colors", "faces", "emotes", "poses"),
        allowNull: false
    },

}, { timestamps: false });

const ITEM_CATEGORIES = [...Items.getAttributes().category.values];

module.exports = { Items, ITEM_CATEGORIES };