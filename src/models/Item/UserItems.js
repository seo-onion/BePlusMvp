const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database'); 
const Users = require('../../models/User/Users'); 
const Items = require('./Items'); 

const UserItems = sequelize.define("UserItem", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Users,
      key: 'userId',
    },
    userId: {
        type: DataTypes.STRING, // It should be equal to Users.js
        allowNull: false,
        references: {
            model: Users,
            key: 'userId',
        },
        onDelete: 'CASCADE',
    },
    itemId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Items,
            key: 'id', // It should be equal to Items.js
        },
        onDelete: 'CASCADE',
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    onDelete: 'CASCADE',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// Relationship definition
UserItems.belongsTo(Items, { foreignKey: 'itemId', as: 'Item' }); // ✅ Esto habilita include: [{ model: Items, as: 'Item' }]
Items.hasMany(UserItems, { foreignKey: 'itemId' }); // (Opcional, pero recomendable si accedes desde Items)

Users.belongsToMany(Items, { through: UserItems, foreignKey: 'userId' });
Items.belongsToMany(Users, { through: UserItems, foreignKey: 'itemId' });

module.exports = UserItems;

