const Achievements = require("../../models/Achievement/Achievements");
const UserAchievements = require("../../models/Achievement/UserAchievements");

// Creates a new achievement record in the database.
class AchievementService {
    static async createAchievement(req) {
        const { name, description, emoji, points } = req;
        return await Achievements.create({
            name: name,
            description: description,
            emoji: emoji,
            point: points,
        });
    }

    static async getAllAchievements() {
        return await Achievements.findAll();
    }

    static async getAchievementById(id) {
        return await Achievements.findByPk(id);
    }

    static async getAchievementByName(name) {
        try {
            return await Achievements.findOne({ where: { name: name } });
        } catch {
            return null;
        }
    }

    static async getUserAchievementById(req) {
        const { userId, achievementId } = req;

        try {
            const userAchievement = await UserAchievements.findOne({
                where: {
                    userId: userId,
                    achievementId: achievementId,
                },
            });
            return userAchievement;
        } catch {
            return null;
        }
    }

    static async getAllUserAchievementById(userId) {
        const userAchievements = await UserAchievements.findAll({
            where: { userId: userId },
        });

        console.log("User achievements:", JSON.stringify(userAchievements, null, 2));
        return userAchievements;
    }
}

module.exports = AchievementService;
