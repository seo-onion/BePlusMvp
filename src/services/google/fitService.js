const axios = require('axios');
const Auth = require("../../models/User/Auth");
const {Users} = require("../../models/User/Users");
const Transaction = require("../../models/Item/Transaction")
const UserSteps = require("../../models/Fit/UserSteps")
const DateHelper = require("../../utils/dateHelper")
const Items = require("../../models/Item/Items")
const { refreshGoogleToken } = require("../token/tokenService");
const { addRockyCoins } = require("../item/economyService");
const { Op } = require("sequelize");

//? Service Auth with google fit
exports.addGoogleAuth = async (req) => {
    try {
        const { token, refreshToken, userId } = req;

        if (!token || !refreshToken || !userId) {
            return { success: false, message: "Faltan datos requeridos" };
        }

        const auth = await Auth.findOne({ where: { userId: userId } });

        if (!auth) return { success: false, message: "El usuario no existe" }

        await auth.update({
            googleToken: token,
            googleRefreshToken: refreshToken
        });

        return {
            success: true,
            message: "Vinculación realizada correctamente con Google Fit",
            auth
        }

    } catch (error) {
        console.error("Error al agregar usuario de Google Fit:", error);
        return {
            success: false,
            message: "No se ha podido vincular con Google Fit"
        }
    }
};

//? Service register the number of steps of yesterday in the BD
exports.registerSteps = async (req) => {
    const { userId, steps } = req;

    console.log("Registrar pasos en la base de datos")

    const { today } = DateHelper.getTodayDate()
    const registro = await UserSteps.findOne({ where: { userId, date: today } });

    if (registro) {
        await registro.update({
            steps: steps
        })
        console.log("Aumentando el numero de pasos");
    } else {
        await UserSteps.create({ userId, steps, date: today });
        console.log("Registrando pasos")
    }
}

//? Get user steps of a day
exports.getDaySteps = async (req) => {
    const { userId, date } = req

    const totalSteps = await UserSteps.findOne({ where: { userId, date: date } });

    if (!totalSteps) {
        return null
    }

    return totalSteps
}


//? Get all steps of a user
exports.getAccumulatedSteps = async (userId) => {
    const result = await UserSteps.sum("steps", { where: { userId } });
    if (!result) {
        return null
    }

    return result
}


//? Get number of steps in a range of time
exports.getSteps = async (req) => {

    const { startTimeMillis, endTimeMillis, userId } = req;
    console.log(`el usuario con el id ${userId} hizo un getStep`)

    try {
        if (!startTimeMillis || !endTimeMillis || !userId) {
            return { success: false, message: "Faltan datos requeridos" };
        }

        const auth = await Auth.findOne({ where: { userId: userId } });

        if (!auth) {
            return { success: false, message: "El usuario no existe" };
        }

        var response;
        try {
            response = await axios.post(
                "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
                { aggregateBy: [{ dataTypeName: "com.google.step_count.delta", dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps" }], bucketByTime: { durationMillis: 86400000 }, startTimeMillis, endTimeMillis },
                { headers: { 'Authorization': `Bearer ${auth.googleToken}`, 'Content-Type': 'application/json' } }
            );
        } catch {
            const newToken = await refreshGoogleToken(userId);

            response = await axios.post(
                "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
                { aggregateBy: [{ dataTypeName: "com.google.step_count.delta", dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps" }], bucketByTime: { durationMillis: 86400000 }, startTimeMillis, endTimeMillis },
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
};


//? claimrockyCoins with yours steps
exports.claimRockyCoins = async (userId) => {

    try {
        console.log("Obteniendo las recompensas del día anterior")
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        const itemId = await Items.findOne({where: {name: "RockyCoin"}})
        const lastClaim = await Transaction.findOne({
            where: {
                userId: userId,
                type: "reward",
                productId: itemId.id,
                createdAt: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            }
        });

        

        if (lastClaim) {
            console.log("Recompensa ya obtenida")
            return null
        }

        const { startTimeMillis, endTimeMillis } = DateHelper.getYesterday();

        const newClaim = await this.getSteps({ startTimeMillis: startTimeMillis, endTimeMillis: endTimeMillis, userId: userId })
        const user = await Users.findByPk(userId)
        const rockyCoinsObtained = Math.floor(newClaim / 50)
        await addRockyCoins({userId: user.userId, quantity: rockyCoinsObtained})

        console.log("Rockycoins reclamadas correctamente")

        return rockyCoinsObtained;

    } catch (error) {
        return null
    }
}

