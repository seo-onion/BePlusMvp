const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database'); // Conexión a la base de datos


const Users = require('../../models/User/Users'); // Importar correctamente el modelo de Usuarios
const Items = require('./Items'); // Importar correctamente el modelo de Items


const UserItems = sequelize.define("UserItem", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.STRING, // Debe coincidir con Users.js
        allowNull: false,
        references: {

            model: Users,
            key: 'userId', // Debe coincidir con Users.js

        },
        onDelete: 'CASCADE',
    },
    itemId: {
        type: DataTypes.UUID, // UUID está bien aquí porque Items usa UUID
        allowNull: false,
        references: {
            model: Items,
            key: 'id', // Debe coincidir con Items.js
        },
        onDelete: 'CASCADE',
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

// Definición de relaciones
Users.belongsToMany(Items, { through: UserItems, foreignKey: 'userId' });
Items.belongsToMany(Users, { through: UserItems, foreignKey: 'itemId' });

module.exports = UserItems;

