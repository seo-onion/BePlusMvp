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
        allowNull: false,
    },
    amount: {
        type: DataTypes.INTEGER
    },
    type: {
        type: DataTypes.ENUM("reward", "compra", "discount") //Types of transaction (it will be more), "compra" está en homenaje a un wbn que prefirió escribir en español
    },
    badge: {
        type: DataTypes.ENUM("rockyCoin", "rockyGem")
    },
    productId: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    
}, { timestamps: false });


module.exports = Transaction;
