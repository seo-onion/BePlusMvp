const axios = require("axios");
const Auth = require("../../models/User/Auth");
require("dotenv").config();

GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET



exports.getOAuthToken = async (tokenUrl, params) => {
    try {
        const response = await axios.post(tokenUrl, params.toString(), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        return response.data;
    } catch (error) {
        console.error("Error en al obtener el token:", error.response?.data || error.message);
        throw new Error("Error en al obtener el token:", error.response?.data || error.message);
    }
}

exports.refreshGoogleToken = async (userId) => {
    console.log(`El token para google fit del usuario ${userId} expiró, se ejecutó refreshGoogleToken()`)
    const auth = await Auth.findOne({ where: { userId } });

    if (!auth || !auth.googleRefreshToken) {
        console.error("Id/Token no encontrado", error.response?.data || error.message);
        throw new Error("Id/Token no encontrado");
    }

    try {
        console.log("Obteniendo nuevo token")

        const response = await axios.post("https://oauth2.googleapis.com/token", null, {
            params: {client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET, refresh_token: auth.googleRefreshToken, grant_type: "refresh_token"}
        });


        const { access_token } = response.data;


        await auth.update({ googleToken: access_token });

        console.log("✅ Nuevo token obtenido y guardado:", access_token);

        return access_token;


    } catch (error) {
        console.error("Error al refrescar token de Google Fit:", error.response?.data || error.message);
        throw new Error("No se pudo actualizar el token de Google Fit");
    }
}

exports.refreshDiscordToken = async (userId) => {
    console.log(`El token de discord del usuario ${userId} expiró, se ejecutó refreshDiscordToken()`)
    const auth = await Auth.findOne({ where: { userId } });

    if (!auth || !auth.discordRefreshToken) {
        console.error("Id invalido o no se encontró un refresh token para Discord", error.response?.data || error.message);
        throw new Error("Id/token no encontrado");
    }

    try {
        console.log("Obteniendo nuevo token")
        const response = await axios.post("https://discord.com/api/oauth2/token", null, {
            params: {client_id: DISCORD_CLIENT_ID, client_secret: DISCORD_CLIENT_SECRET, refresh_token: auth.discordRefreshToken, grant_type: "refresh_token"},
            headers: {"Content-Type": "application/x-www-form-urlencoded"}
        });

        const {access_token} = response.data;

        auth.update({token: access_token})

        console.log("✅ Nuevo token obtenido y guardado:", access_token)
        return access_token;

    } catch (error) {
        console.error("Error al refrescar token de Discord:", error.response?.data || error.message);
        throw new Error("No se pudo refrescar el token de Discord.");
    }
}

