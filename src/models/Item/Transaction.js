const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const Transaction = sequelize.define("Transaction", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.STRING
    },
    amount: {
        type: DataTypes.INTEGER
    },
    type: {
        type: DataTypes.ENUM("reward") //Types of transaction (it will be more)
    },

    productId: {
        type: DataTypes.STRING
    },

    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    
}, { timestamps: false });


module.exports = Transaction;
