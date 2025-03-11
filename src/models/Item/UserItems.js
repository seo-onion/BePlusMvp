const { DataTypes } = require('sequelize');
const {sequelize} = require('../../config/database'); // Asegúrate de que la configuración está bien establecida

const User = require('../../models/User/Users');
const Items = require('./Items');

const UserItems = sequelize.define("UserItem", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    itemId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Items,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
})


// Definición de relaciones
User.belongsToMany(Items, { through: UserItems, foreignKey: 'userId' });
Items.belongsToMany(User, { through: UserItems, foreignKey: 'itemId' });

module.exports = UserItems;
