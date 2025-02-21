const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('../User/Users');
const Item = require('../Item/Item');

const Transaction = sequelize.define('Transaction', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('earn', 'spend'),
    allowNull: false
  },
  currency: {
    type: DataTypes.ENUM('rocky_coins', 'rocky_gems'),
    allowNull: false
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  item_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Item,
      key: 'id'
    },
    allowNull: true
  },
  description: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true
});



module.exports = Transaction;
