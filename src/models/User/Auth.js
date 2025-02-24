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
    googleToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    googleRefreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });
  
  module.exports = Auth;
  