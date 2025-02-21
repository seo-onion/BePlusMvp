const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const Auth = sequelize.define("Auth", {
    userId: {
      type: DataTypes.STRING,
      primaryKey: true,
      references: {
        model: "Users",
        key: "userId",
      },
      onDelete: "CASCADE",
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
      allowNull: true,
    },
    GoogleRefreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });
  
  module.exports = Auth;
  