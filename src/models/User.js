const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const User = sequelize.define(
  "User",
  {
    userid: {
      type: DataTypes.STRING, 
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true }, 
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refreshToken: { 
      type: DataTypes.STRING,
      allowNull: false,
    },
    GoogleToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    GoogleRefreshToken: { 
      type: DataTypes.STRING,
      allowNull: false,
    },

    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 13 },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM("male", "female", "other", "prefer_not_to_say"),
      allowNull: true,
    },
  }
);

module.exports = User;
