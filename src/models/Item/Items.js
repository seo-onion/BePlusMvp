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
        type: DataTypes.ENUM("badge"),
        allowNull: false
    },

}, { timestamps: false });


module.exports = Items;
