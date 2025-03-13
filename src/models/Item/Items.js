const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const Items = sequelize.define("Items", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
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
        allowNull: false
    }
}, {
    tableName: 'Items',
    timestamps: false
});

module.exports = Items;
