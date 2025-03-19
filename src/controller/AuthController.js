const axios = require("axios");
const { getOAuthToken } = require("../services/token/tokenService");
const { createUser, assignRoleToUser } = require("../services/user/userService");
const PrivateChannelNotificationService = require("../services/notification/privateNotificationService");

const { getOAuthToken } = require("../services/token/tokenService");
const UserService = require("../services/user/userService");
const GoogleFitService  = require("../services/google/fitService");
const PrivateChannelNotificationService = require("../services/notification/privateNotificationService");
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const VERIFICATED_ROLE = process.env.DISCORD_VERIFICATED_ROLE;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const DISCORD_APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

<<<<<<< HEAD
// Generates the URL for redirecting the user to Discord's OAuth2 consent screen.
const discordRedirect = async (req, res) => {
    const authUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_APPLICATION_ID}&response_type=code&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&scope=identify%20email%20guilds%20connections`;
    res.redirect(authUrl);
};

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
            client_id: DISCORD_APPLICATION_ID,
            client_secret: DISCORD_CLIENT_SECRET,
            code,
            grant_type: "authorization_code",
            redirect_uri: DISCORD_REDIRECT_URI,
        });
        // Fetching the authenticated user's information from Discord.
        const tokenResponse = await getOAuthToken(tokenUrl, params);
        const { access_token, refresh_token } = tokenResponse;

        const userResponse = await axios.get("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${access_token}` },
        });
        const { id, email } = userResponse.data;

        // Creating a new user in the database with the retrieved information.
        const newUser = await UserService.createUser({
            userId: id,
            email: email,
            token: access_token,
            refreshToken: refresh_token,
        });

        // Assigning the verified role to the user in the Discord server.
        await UserService.assignRoleToUser({
            guildId: GUILD_ID,
            userId: id,
            roleId: VERIFICATED_ROLE,
        });

        PrivateChannelNotificationService.sendPrivateChannelNotification(id, "Has sido registrado exitosamente :D");

        res.render("response", {
            success: true,
            message: "Felicidades, acabas de registrarte en Be+",
        });
    } catch (error) {
        console.error("❌ Error en la autenticación:", error);
        res.status(500).send("Error al autenticar con Discord.");
    }
};

// Generates the URL for redirecting the user to Google's OAuth2 consent screen for Google Fit.
const googleRedirect = async (req, res) => {
    const { id } = req.query;

    if (!id) return res.status(400).send("Error: Falta el ID de usuario de Discord.");

    try {
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&response_type=code&scope=https://www.googleapis.com/auth/fitness.activity.read&access_type=offline&prompt=consent&state=${id}`;
        res.redirect(authUrl);
    } catch (error) {
        console.error("❌ Error en la redirección:", error);
        res.status(500).send("Error al autenticar con Google.");
    }
};

// Handles the OAuth2 authentication process with Google Fit.
const googleAuth = async (req, res) => {
    const { code, state } = req.query;

  try {
    // Paso 1: Obtener Token
    const tokenUrl = "https://discord.com/api/oauth2/token";
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: DISCORD_REDIRECT_URI,
    });

    try {
        // Requesting the access token from Google using the provided authorization code.
        const params = new URLSearchParams({
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_REDIRECT_URI,
            grant_type: "authorization_code",
        });

        const { access_token, refresh_token } = tokenResponse;

        const response = await getOAuthToken(tokenUrl, params);
        const { access_token, refresh_token } = response;

       // Adding Google Fit authentication data to the user profile
        const authUser = await GoogleFitService.addGoogleAuth({
            token: access_token,
            refreshToken: refresh_token,
            userId: state,
        });

        // Sending a private notification confirming successful Google Fit linking.
        PrivateChannelNotificationService.sendPrivateChannelNotification(state, "Vinculado exitosamente con Google Fit");
        res.render("response", authUser);

    } catch (error) {
        console.error("❌ Error en la autenticación con Google:", error);
        res.status(500).send("Error al autenticar con Google.");
    }
};
