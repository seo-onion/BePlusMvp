const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const Transaction = sequelize.define("Transaction", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM("reward"),
        allowNull: false
    },

    productId: {
        type: DataTypes.STRING,
        allowNull: true
    },

    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    
}, { timestamps: false });


module.exports = Transaction;
