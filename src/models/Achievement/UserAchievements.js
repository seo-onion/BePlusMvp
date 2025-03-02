const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Achievements = require("./Achievements");
const Users = require("../User/Profile"); 

const UserAchievements = sequelize.define("UserAchievements", {
    userId: {
        type: DataTypes.STRING,  
        allowNull: false,
        references: {
            model: Users,  
            key: "userId"
        },
        onDelete: "CASCADE"
    },
    achievementId: {
        type: DataTypes.UUID, 
        allowNull: false,
        references: {
            model: Achievements,  
            key: "id"
        },
        onDelete: "CASCADE"
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "UserAchievements",
    timestamps: false
});


Users.belongsToMany(Achievements, { through: UserAchievements, foreignKey: "userId" });
Achievements.belongsToMany(Users, { through: UserAchievements, foreignKey: "achievementId" });

module.exports = UserAchievements;
 