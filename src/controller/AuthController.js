const axios = require("axios");
const { getOAuthToken } = require("../services/token/tokenService");
const PrivateChannelNotificationService = require("../services/notification/privateNotificationService");
const UserService = require("../services/user/userService");
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const VERIFICATED_ROLE = process.env.DISCORD_VERIFICATED_ROLE;

const DISCORD_APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;


const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;




// Generates the URL for redirecting the user to Discord's OAuth2 consent screen.
exports.discordRedirect = async (req, res) => {
    const authUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_APPLICATION_ID}&response_type=code&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&scope=identify%20email%20guilds%20connections`;
    res.redirect(authUrl);
};

// Handles the OAuth2 authentication process with Discord.
exports.discordAuth = async (req, res) => {
    const code = req.query.code;

    const user = await UserService.getUser(code)

    if (!user) {
        return res.status(400).send("ya has sido registrado en BePlus");
    }

    if (!code) {
        return res.status(400).send("No se recibió el código de autorización.");
    }

    try {
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

        //TODO: add a embed to notification
        PrivateChannelNotificationService.sendPrivateChannelNotification(id, "Has sido registrado exitosamente :D");

        res.render("discordLogin");

    } catch (error) {
        console.error("Authentication error:", error);
        res.status(500).send("Error al autenticar con Discord.");
    }
};

// Generates the URL for redirecting the user to Google's OAuth2 consent screen for Google Fit.
exports.googleRedirect = async (req, res) => {
    const { id } = req.query;
    
    if (!id) return res.status(400).send("Error: Falta el ID de usuario");

    try {
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&response_type=code&scope=https://www.googleapis.com/auth/fitness.activity.read&access_type=offline&prompt=consent&state=${id}`;
        res.redirect(authUrl);
    } catch (error) {
        console.error("Error in redirection:", error);
        res.status(500).send("Error al autenticar con Google.");
    }
};

// Handles the OAuth2 authentication process with Google Fit.
exports.googleAuth = async (req, res) => {
    const { code, state } = req.query;

    if (!state) return res.status(400).send("Error: User ID is missing.");
    if (!code) return res.status(400).send("Error: CODE is missing.");

    try {
        const tokenUrl = "https://oauth2.googleapis.com/token";
        // Requesting the access token from Google using the provided authorization code.
        const params = new URLSearchParams({
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_REDIRECT_URI,
            grant_type: "authorization_code",
        });

        const response = await getOAuthToken(tokenUrl, params);
        const { access_token, refresh_token } = response;

        // Adding Google Fit authentication data to the user profile
        await UserService.editUser({
            identifier: state,
            googleToken: access_token,
            googleRefreshToken: refresh_token,
        });

        // Sending a private notification confirming successful Google Fit linking.
        PrivateChannelNotificationService.sendPrivateChannelNotification(state, "Vinculado exitosamente con Google Fit");
        res.render("fitLogin");

    } catch (error) {
        console.error("Google authentication error: ", error);
        res.status(500).send("Error authenticating with Google.");
    }
}
