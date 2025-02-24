const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const Rank = sequelize.define("Rank", {
    userId: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    steps: {
        type: DataTypes.INTEGER
    }
}, { timestamps: false });

module.exports = Currency;
