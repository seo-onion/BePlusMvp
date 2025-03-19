const axios = require("axios");
const Auth = require("../../models/User/Auth");

GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET

// Retrieves an OAuth token from the given URL with the specified parameters.
exports.getOAuthToken = async (tokenUrl, params) => {
    try {
        const response = await axios.post(tokenUrl, params.toString(), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        return response.data;
    } catch (error) {
        console.error("Error getting token: ", error.response?.data || error.message);
        throw new Error("Error getting token: ", error.response?.data || error.message);
    }
};

// Refreshes the Google OAuth token using the stored refresh token for the specified user.
exports.refreshGoogleToken = async (userId) => {
    console.log(`El token para google fit del usuario ${userId} expiró, se ejecutó refreshGoogleToken()`);
    const auth = await Auth.findOne({ where: { userId } });

    if (!auth || !auth.googleRefreshToken) {
        console.error("Id/Token not found", error.response?.data || error.message);
        throw new Error("Id/Token not found");
    }

    try {
        console.log("Getting a new token");

        const response = await axios.post("https://oauth2.googleapis.com/token", null, {
            params: {
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                refresh_token: auth.googleRefreshToken,
                grant_type: "refresh_token",
            },
        });

        const { access_token } = response.data;

        await auth.update({ googleToken: access_token });

        console.log("✅ Nuevo token obtenido y guardado:", access_token);

        return access_token;
    } catch (error) {
        console.error("Error al refrescar token de Google Fit:", error.response?.data || error.message);
        throw new Error("No se pudo actualizar el token de Google Fit");
    }
};

// Refreshes the Discord OAuth token using the stored refresh token for the specified user.
exports.refreshDiscordToken = async (userId) => {
    console.log(`The Discord token for user ${userId} has expired, refreshDiscordToken() was executed`);
    const auth = await Auth.findOne({ where: { userId } });

    if (!auth || !auth.discordRefreshToken) {
        console.error("Invalid ID or no refresh token found for Discord", error.response?.data || error.message);
        throw new Error("Id/token not found");
    }

    try {
        console.log("getting a new token");
        const response = await axios.post("https://discord.com/api/oauth2/token", null, {
            params: {
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                refresh_token: auth.discordRefreshToken,
                grant_type: "refresh_token",
            },
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const { access_token } = response.data;

        auth.update({ token: access_token });

        console.log("New token obtained and saved", access_token);
        return access_token;

    } catch (error) {
        console.error("Error refreshing Discord token: ", error.response?.data || error.message);
        throw new Error("Failed to refresh Discord token.");
    }
};

