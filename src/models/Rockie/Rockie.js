const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const Rockie = sequelize.define("Rockie", {
    id: { // 📌 El ID de Rockie será el mismo que el ID del usuario
        type: DataTypes.STRING,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    color: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    skinItem: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    hatItem: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    clothesItem: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    experience: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
});

module.exports = Rockie;

