const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const Currency = sequelize.define("Currency", {
    userId: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    rockyCoins: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    type: {
        type: DataTypes.ENUM("reclamar", "racha"),
        allowNull: false
    },
    lastClaimedAt: { 
        type: DataTypes.DATE,
        defaultValue: DataTypes.DATEONLY
    }
}, { timestamps: false });

module.exports = Currency;
