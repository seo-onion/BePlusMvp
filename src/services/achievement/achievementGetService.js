const UserAchievements = require("../../models/Achievement/UserAchievements");
const dateHelper = require ("../../utils/dateHelper");
const {getAccumulatedSteps, getDaySteps} = require("../google/fitService")
const {getAchievementByName} = require("./achievementService")
class AchievementGetService {
    
    static async firstStep(userId) {
        const achievement = await getAchievementByName("Primer Paso");
        const totalSteps = await getAccumulatedSteps(userId)
        if(totalSteps > 0){
            await UserAchievements.create({
                userId: userId,
                achievementId: achievement.id
            })
            
            console.log("Obteniendo logro firstStep")
            return achievement
        }
        console.log("Logro no obtenido")
        return null
    }

    static async tenK(userId) {
        const {today} = dateHelper.getTodayDate();
        const achievement = await getAchievementByName("10k Club");
        const total = await getDaySteps({
            userId: userId,
            date: today
        })

        if (total >= 10000){
            await UserAchievements.create({
                userId: userId,
                achievementId: achievement.id
            })

            return achievement
        }
        console.log("Logro no obtenido")
        return null
    }

    static async marathoner(userId) {
        const total = await getAccumulatedSteps(userId)
        const achievement = await getAchievementByName("Maratonista")
        if(total >= 42195){
            await UserAchievements.create({
                userId: userId,
                achievementId: achievement.id
            })
            console.log("Obteniendo logro marathoner")
            return achievement
        }
        console.log("Logro no obtenido")
        return null
    }

    static async hundredKWalker(userId) {
        const totalSteps = await getAccumulatedSteps(userId)
        const achievement = await getAchievementByName("100k Walker")

        if(totalSteps >= 100000){
            await UserAchievements.create({
                userId: userId,
                achievementId: achievement.id
            })
            console.log("Obteniendo logro 100k walker")
            return achievement
        }
        
        console.log("Logro no obtenido")
        return null
    }

    
}

module.exports = AchievementGetService;
