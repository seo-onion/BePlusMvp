const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Rocky = sequelize.define(
    "Rocky",
    {
        id: {
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
    },
    {
        tableName: "Rocky",
        timestamps: true,
    }
);

module.exports = Rocky;
