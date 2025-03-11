const { DataTypes } = require('sequelize');
const {sequelize} = require('../../config/database'); // Asegúrate de que la configuración está bien establecida

const Users = require('../../models/User/Users');
const {Items }= require('./Items');

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
            model: Users,
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
Users.belongsToMany(Items, { through: UserItems, foreignKey: 'userId' });
Items.belongsToMany(Users, { through: UserItems, foreignKey: 'itemId' });

module.exports = {UserItems};
