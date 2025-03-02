const { DataTypes } =  require("sequelize");
const { sequelize } = require("../../config/database");
//const { dictionaryItemsFromCategory } = require("../../models/Store/loadItem");
const itemsData = require("../../services/Store/storeItems.json");

const ITEM_CATEGORIES = Object.keys(itemsData);

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
        type: DataTypes.STRING,
        allowNull: false,
    },

}, { timestamps: false });

module.exports = { Items, ITEM_CATEGORIES};