const axios = require('axios');
const UserService = require("../../services/user/userService");
const UserSteps = require("../../models/Fit/UserSteps");
const DateHelper = require("../../utils/dateHelper");
const { refreshGoogleToken } = require("../token/tokenService");
const EconomyService = require("../item/economyService");
const { error } = require('console');
const TransactionService = require('../item/transactionServices');

class GoogleFitService {

    static async registerSteps(req) {
        try {
            const { userId, steps } = req;
            const { today } = DateHelper.getTodayDate();
            const registro = await UserSteps.findOne({ where: { userId, date: today } });

            if (registro) {
                await registro.update({ steps: steps });
                console.log("Increasing the number of steps");
            } else {
                await UserSteps.create({ userId, steps, date: today });
                console.log("Recording steps");
            }

            return true
        } catch {
            console.error("Error recording steps ", error)
            return false
        }
    }

    static async getDaySteps(req) {
        try {
            const { userId, date } = req;
            const totalSteps = await UserSteps.findOne({ where: { userId, date: date } });
            return totalSteps || null;
        } catch (error) {
            console.error("Error fetching day steps ", error)
            return null
        }
    }

    static async getAccumulatedSteps(userId) {
        try {
            const result = await UserSteps.sum("steps", { where: { userId } });
            return result || null;
        } catch (error) {
            console.error("Error fetching accumulated steps ", error)
            return null
        }

    }

    static async getSteps(req) {
        const { startTimeMillis, endTimeMillis, userId } = req;

        try {
            if (!startTimeMillis || !endTimeMillis || !userId) {
                return null;
            }


            const user = await UserService.getUser(userId);
            if (!user) {
                return null;
            }

            let response;

            try {
                response = await axios.post(
                    "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
                    {
                        aggregateBy: [{ dataTypeName: "com.google.step_count.delta", dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps" }],
                        bucketByTime: { durationMillis: 86400000 },
                        startTimeMillis,
                        endTimeMillis,
                    },
                    { headers: { 'Authorization': `Bearer ${user.Auth.googleToken}`, 'Content-Type': 'application/json' } }
                );
            } catch {
                const newToken = await refreshGoogleToken(userId);
                response = await axios.post(
                    "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
                    {
                        aggregateBy: [{ dataTypeName: "com.google.step_count.delta", dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps" }],
                        bucketByTime: { durationMillis: 86400000 },
                        startTimeMillis,
                        endTimeMillis,
                    },
                    { headers: { 'Authorization': `Bearer ${newToken}`, 'Content-Type': 'application/json' } }
                );
            }

            const steps = response.data.bucket.reduce((total, bucket) => {
                const stepCount = bucket.dataset[0]?.point[0]?.value[0]?.intVal || 0;
                return total + stepCount;
            }, 0);

            return steps;

        } catch (error) {
            console.error("Error fetching step data:", error.response?.data || error.message);
            return null;
        }
    }

    static async claimRockyCoins(userId) {
        try {
            console.log("Getting the rewards from the previous day");
            const lastClaim = await TransactionService.getLastDailyReward(userId)
            console.log("Last claim: ", lastClaim)
            if (lastClaim) {
                console.log("Reward already obtained");
                return null;    
            }

            const { startTimeMillis, endTimeMillis } = DateHelper.getYesterday();

            const newClaim = await this.getSteps({ startTimeMillis: startTimeMillis, endTimeMillis: endTimeMillis, userId: userId });

            const rockyCoinsObtained = Math.floor(newClaim / 50);
            await EconomyService.addRockyCoins({ userId, quantity: rockyCoinsObtained });
            console.log("Rockycoins successfully claimed");
            return rockyCoinsObtained;

        } catch (error) {
            return null;
        }
    }
}

module.exports = GoogleFitService;
