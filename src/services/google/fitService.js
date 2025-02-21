const Auth = require("../../models/User/Auth")
const axios = require('axios');


exports.AddGoogleAuth = async (req) => {
    try {
        const { token, refreshToken, userId } = req;

        if (!token || !refreshToken || !userId) {
            return { success: false, message: "Faltan datos requeridos" };
        }

        let user = await Auth.findOne({ where: { userId: userId } });

        if (!user) return {success: false, message: "El usuario no existe"}

        await user.update({
            googleAccessToken: token,
            googleRefreshToken: refreshToken
        });

        return {
            success: true,
            message: "✅ Tokens de Google Fit actualizados correctamente",
            user
        }

    } catch (error) {
        console.error("❌ Error al agregar usuario de Google Fit:", error);
        throw new Error(error.response?.data || error.message);
    }
};


