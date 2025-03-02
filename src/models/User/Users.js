const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Profile = require("./Profile");
const Auth = require("./Auth");


const User = sequelize.define("Users", {
    userId: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true },
        unique: true,
    },
    rockyCoins: {
        type: DataTypes.INTEGER,
        allowNull:false,
        defaultValue: 0
    },
    rockyGems: {
        type: DataTypes.INTEGER,
        allowNull:false,
        defaultValue: 0
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});


User.hasOne(Auth, { foreignKey: "userId", onDelete: "CASCADE" });
Auth.belongsTo(User, { foreignKey: "userId" });


User.hasOne(Profile, { foreignKey: "userId", onDelete: "CASCADE" });
Profile.belongsTo(User, { foreignKey: "userId" });

module.exports = User;