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
    type: DataTypes.STRING, // Debe coincidir con el campo en Users.js
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
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// 📌 Definición de relaciones
UserItems.belongsTo(Items, { foreignKey: 'itemId', as: 'Item' }); 
Items.hasMany(UserItems, { foreignKey: 'itemId' });

Users.belongsToMany(Items, { through: UserItems, foreignKey: 'userId' });
Items.belongsToMany(Users, { through: UserItems, foreignKey: 'id' });

module.exports = UserItems;
