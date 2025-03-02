const Achievements = require("../../models/Achievement/Achievements")
const UserAchievements = require("../../models/Achievement/UserAchievements")

exports.createAchievement = async (req) => {
    const { name, description, emoji, points } = req;
    return await Achievements.create({
        name: name,
        description: description,
        emoji: emoji,
        point: points
    });
}


exports.getAllAchievements = async () => {
    return await Achievements.findAll();
}

exports.getAchievementById = async (id) => {
    return await Achievements.findByPk(id);
}

exports.getAchievementByName = async (name) => {
    try{
        return await Achievements.findOne({ where: { name: name } });
    } catch {
        return null
    }
}

exports.getUserAchievementById = async (req) => {
    const { userId, achievementId } = req;

    try {
        const userAchievement = await UserAchievements.findOne({
            where: {
                userId: userId,
                achievementId: achievementId
            }
        })
        return userAchievement
    } catch {
        return null
    }
}

exports.getAllUserAchievementById = async (userId) => {
    const userAchievements = await UserAchievements.findAll({
        where: {
            userId: userId
        }
    });

    console.log("User achievements:", JSON.stringify(userAchievements, null, 2)); 
    return userAchievements;
};