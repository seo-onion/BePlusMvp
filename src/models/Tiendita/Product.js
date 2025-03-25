const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const Product = sequelize.define("Product", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rebate: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },

});

module.exports = Product;

