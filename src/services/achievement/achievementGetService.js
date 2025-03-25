const UserAchievements = require("../../models/Achievement/UserAchievements");
const dateHelper = require("../../utils/dateHelper");
const GoogleFitService= require("../google/fitService");
const AchievementService = require("./achievementService");

class AchievementGetService {

    // Award 'First Step' achievement if the user has taken any steps.
    static async firstStep(userId) {
        const achievement = await AchievementService.getAchievementByName("Primer Paso");
        const totalSteps = await GoogleFitService.getAccumulatedSteps(userId);

        if (totalSteps > 0) {
            await UserAchievements.create({
                userId: userId,
                achievementId: achievement.id
            });

            console.log("Obtained achievement: firstStep");
            return achievement;
        }

        console.log("Achievement not obtained");
        return null;
    }

    // Award '10k Club' achievement if the user has taken at least 10,000 steps today.
    static async tenK(userId) {
        const { today } = dateHelper.getTodayDate();
        const achievement = await AchievementGetService.getAchievementByName("10k Club");
        const total = await GoogleFitService.getDaySteps({
            userId: userId,
            date: today
        });

        if (total >= 10000) {
            await UserAchievements.create({
                userId: userId,
                achievementId: achievement.id
            });

            console.log("Obtained achievement: 10k Club");
            return achievement;
        }

        console.log("Achievement not obtained");
        return null;
    }

    // Award 'Marathoner' achievement if the user has accumulated at least 42,195 steps.
    static async marathoner(userId) {
        const total = await GoogleFitService.getAccumulatedSteps(userId);
        const achievement = await AchievementGetService.getAchievementByName("Maratonista");

        if (total >= 42195) {
            await UserAchievements.create({
                userId: userId,
                achievementId: achievement.id
            });

            console.log("Obtained achievement: marathoner");
            return achievement;
        }

        console.log("Achievement not obtained");
        return null;
    }

    // Award '100k Walker' achievement if the user has accumulated at least 100,000 steps.
    static async hundredKWalker(userId) {
        const totalSteps = await GoogleFitService.getAccumulatedSteps(userId);
        const achievement = await AchievementGetService.getAchievementByName("100k Walker");

        if (totalSteps >= 100000) {
            await UserAchievements.create({
                userId: userId,
                achievementId: achievement.id
            });

            console.log("Obtained achievement: 100k Walker");
            return achievement;
        }

        console.log("Achievement not obtained");
        return null;
    }
}

module.exports = AchievementGetService;