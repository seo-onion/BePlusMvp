const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Profile = require("./Profile");
const Auth = require("./Auth");


const Users = sequelize.define("Users", {
    userId: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
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


Users.hasOne(Auth, { foreignKey: "userId", onDelete: "CASCADE" });
Auth.belongsTo(Users, { foreignKey: "userId" });


Users.hasOne(Profile, { foreignKey: "userId", onDelete: "CASCADE" });
Profile.belongsTo(Users, { foreignKey: "userId" });


module.exports = {Users};

