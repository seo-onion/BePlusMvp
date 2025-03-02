const axios = require('axios');
const Auth = require("../../models/User/Auth");
const User = require("../../models/User/Users");
const Transaction = require("../../models/Item/Transaction");
const { refreshGoogleToken } = require("../token/tokenService");
const { createTransaction } = require("../item/economyService");
const { Op } = require("sequelize");

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
                {aggregateBy: [{ dataTypeName: "com.google.step_count.delta", dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"}], bucketByTime: { durationMillis: 86400000 },startTimeMillis, endTimeMillis},
                {headers: {'Authorization': `Bearer ${auth.googleToken}`, 'Content-Type': 'application/json'}}
            );
        } catch {
            await refreshGoogleToken(userId);

            response = await axios.post(
                "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
                {aggregateBy: [{ dataTypeName: "com.google.step_count.delta", dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"}], bucketByTime: { durationMillis: 86400000 },startTimeMillis, endTimeMillis},
                {headers: {'Authorization': `Bearer ${auth.googleToken}`, 'Content-Type': 'application/json'}}
            );
        }

        const steps = response.data.bucket.reduce((total, bucket) => {
            const stepCount = bucket.dataset[0]?.point[0]?.value[0]?.intVal || 0;
            return total + stepCount;
        }, 0);

        return { success: true, message: `numero de pasos: ${steps}`, steps };

    } catch (error) {
        console.error("Error fetching step data:", error.response?.data || error.message);
        return { success: false, message: "Error al obtener los pasos." };
    }
};


exports.claimRockyCoins = async (userId) => {

    try {
        console.log("Obteniendo las recompensas del día anterior")
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
        const lastClaim = await Transaction.findOne({
            where: {
                userId: userId,
                type: "reward",
                productId: "db98908a-466d-4681-a40a-fe8e06af9d8b",
                createdAt: {
                    [Op.between]: [startOfDay, endOfDay] // ✅ Filtrar por transacciones del día
                }
            }
        });

        
        if (lastClaim) {
            console.log("Recompensa ya obtenida")
            return {
                success: false,
                message: "Recompensa ya obtenida"
            }
        }
        
        const newClaim = await this.getSteps({ startTimeMillis: Date.now() - 86400000 * 2, endTimeMillis: Date.now() - 86400000, userId: userId })
        const user = await User.findByPk(userId)

        const oldRockyCoins = user.rockyCoins
        const rockyCoinsObtained = Math.floor(newClaim.steps / 1000)

        await createTransaction({
            userId: userId,
            amount: rockyCoinsObtained,
            type: "reward",
            productId: "db98908a-466d-4681-a40a-fe8e06af9d8b"
        })


        await user.update({
            rockyCoins: oldRockyCoins + rockyCoinsObtained
        })

        console.log("Rockycoins reclamadas correctamente")
        return {
            success: true,
            message: `RockyCoins obtenidas: ${rockyCoinsObtained}`
        }

    } catch (error) {
        return { success: false, message: "Error al obtener los rockycoins" }
    }
}




exports.ranking = async (userId) => {

    try {

        const lastClaim = await Claim.findOne(
            {
                where: {
                    userId: userId,
                    lastClaimedAt: new Date().toISOString().split("T")[0],
                    type: "racha"
                }
            })

        console.log(lastClaim)
        if (lastClaim) {
            return {
                success: false,
                message: "Ya reclamaste esta racha"
            }
        }

        const newClaim = await this.getSteps({ startTimeMillis: Date.now() - 86400000 * 2, endTimeMillis: Date.now() - 86400000, userId: userId })
        const user = await User.findByPk(userId)

        const oldRockyGems = user.rockyGems;
        var newGems = 0;


        if (newClaim.steps < 10000) {
            return {
                success: false,
                message: "Aún no alcanzas ninguna meta de pasos"
            }
        } else {


            if (newClaim.steps >= 10000 && newClaim.steps < 12499) {
                newGems = 3;
            } else if (newClaim.steps >= 12499 && newClaim.steps < 15000) {
                newGems = 6;
            } else if (newClaim.steps >= 15000) {
                newGems = 9;
            }

            await Claim.create({
                userId: userId,
                rockyCoins: newGems,
                type: "racha",
                lastClaimedAt: new Date().toISOString().split("T")[0]
            })

            await user.update({
                rockyGems: oldRockyGems + newGems
            })



        }

        return {
            success: true,
            message: `RockyGems obtenidas: ${newGems}`
        }


    } catch (error) {
        return { success: false, message: "Error al obtener los rockycoins" }
    }
}