const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const UserSteps = sequelize.define("UserSteps", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    steps: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    date: {
        type: DataTypes.DATEONLY, 
        allowNull: false
    }
}, {
    tableName: "UserSteps",
    timestamps: false
});

module.exports = UserSteps;
