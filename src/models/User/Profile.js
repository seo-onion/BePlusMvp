const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const Profile = sequelize.define("Profile", {
    userId: {
        type: DataTypes.STRING,
        primaryKey: true,
        references: {
            model: "Users",
            key: "userId",
        },
        onDelete: "CASCADE",
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
});

module.exports = Profile;
