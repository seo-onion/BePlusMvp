const axios = require("axios");
require("dotenv").config();

const { getOAuthToken } = require("../services/token/tokenService")
const { createUser, assignRoleToUser } = require("../services/user/userService")
const { addGoogleAuth } = require("../services/google/fitService")
const PrivateChannelNotificationService = require("../services/notification/privateNotificationService")

// Environment variables for role management and OAuth credentials.
const GUILD_ID = process.env.GUILD_ID
NOT_VERIFICATED_ROLE = process.env.NOT_VERIFICATED_ROLE
VERIFICATED_ROLE = process.env.VERIFICATED_ROLE

const GOOGLE_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_URI = process.env.GOOGLE_REDIRECT_URI
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

const DISCORD_CLIENT_ID = process.env.APPLICATION_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

// Generates the URL for redirecting the user to Discord's OAuth2 consent screen.
const discordRedirect = async (req, res) => {
    const authUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&scope=identify%20email%20guilds%20connections`;
    res.redirect(authUrl);
}

// Handles the OAuth2 authentication process with Discord.
const discordAuth = async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).send("No se recibió el código de autorización.");
    }

    try {
        // Requesting the access token from Discord using the provided authorization code.
        const tokenUrl = "https://discord.com/api/oauth2/token";
        const params = new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            client_secret: DISCORD_CLIENT_SECRET,
            code,
            grant_type: "authorization_code",
            redirect_uri: DISCORD_REDIRECT_URI,
        });
        // Fetching the authenticated user's information from Discord.
        const tokenResponse = await getOAuthToken(tokenUrl, params);
        const { access_token, refresh_token } = tokenResponse;

        const userResponse = await axios.get("https://discord.com/api/users/@me", { headers: { Authorization: `Bearer ${access_token}` }, });
        const { id, email } = userResponse.data;

        // Creating a new user in the database with the retrieved information.
        const newUser = await createUser({
            id: id,
            email: email,
            token: access_token,
            refreshToken: refresh_token
        })

        console.log(tokenResponse, userResponse.data)

        // Assigning the verified role to the user in the Discord server.
        await assignRoleToUser({
            guildId: GUILD_ID,
            userId: id,
            roleId: VERIFICATED_ROLE
        })

        PrivateChannelNotificationService.sendPrivateChannelNotification(id, "Haz sido registrado exitosamente :D   ")

        res.render("response", {
            success: newUser.success,
            message: newUser.message
        })

    } catch (error) {
        console.error("❌ Error en la autenticación:", error);
        res.status(500).send("Error al autenticar con Discord.", error);
    }
}

// Generates the URL for redirecting the user to Google's OAuth2 consent screen for Google Fit.
const googleRedirect = async (req, res) => {
    const { id } = req.query;

    if (!id) return res.status(400).send("Error: Falta el ID de usuario de Discord.");

    try {
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_ID}&redirect_uri=${GOOGLE_URI}&response_type=code&scope=https://www.googleapis.com/auth/fitness.activity.read&access_type=offline&prompt=consent&state=${id}`;
        res.redirect(authUrl);
    } catch (error) {
        console.error("❌ Error en la redireccion:", error);
        res.status(500).send("Error al autenticar con Google.");
    }
};

// Handles the OAuth2 authentication process with Google Fit.
const googleAuth = async (req, res) => {
    const { code, state } = req.query;

    if (!state) return res.status(400).send("Error: Falta el ID de usuario de Discord.");
    if (!code) return res.status(400).send("Error: Falta el CODE de la url de Discord.");

    try {
        // Requesting the access token from Google using the provided authorization code.
        const params = new URLSearchParams({
            code,
            client_id: GOOGLE_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_URI,
            grant_type: "authorization_code",
        });

        const tokenUrl = "https://oauth2.googleapis.com/token";

        const response = await getOAuthToken(tokenUrl, params); //Service to get auth token

        const { access_token, refresh_token } = response;

        // Adding Google Fit authentication data to the user profile.
        const authUser = await addGoogleAuth({
            token: access_token,
            refreshToken: refresh_token,
            userId: state
        })

        // Sending a private notification confirming successful Google Fit linking.
        PrivateChannelNotificationService.sendPrivateChannelNotification(id, "Vinculado exitosamente con google fit")
        res.render("response", authUser)

    } catch (error) {
        console.error("❌ Error en la autenticación:", error);
        res.status(500).send("Error al autenticar con Google.");
    }

}


module.exports = { discordAuth, discordRedirect, googleAuth, googleRedirect };