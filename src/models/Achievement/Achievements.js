const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const Achievements = sequelize.define("Achievements", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.STRING
    },
    emoji: {
        type: DataTypes.STRING
    },
    point: {
        type: DataTypes.INTEGER
    }
}, { timestamps: false });

module.exports = Achievements;
