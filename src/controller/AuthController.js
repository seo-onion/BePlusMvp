const axios = require("axios");
const { getOAuthToken } = require("../services/token/tokenService");
const { createUser, assignRoleToUser } = require("../services/user/userService");
const PrivateChannelNotificationService = require("../services/notification/privateNotificationService");

require("dotenv").config();

const GUILD_ID = process.env.GUILD_ID;
const VERIFICATED_ROLE = process.env.VERIFICATED_ROLE;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// =======================
// DISCORD AUTH FLOW
// =======================
exports.discordRedirect = async (req, res) => {
  const authUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&scope=identify%20email%20guilds%20connections`;
  res.redirect(authUrl);
};

exports.discordAuth = async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send("No se recibió el código de autorización.");
  }

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

    const tokenResponse = await getOAuthToken(tokenUrl, params);
    console.log(tokenResponse);

    const { access_token, refresh_token } = tokenResponse;

    // Paso 2: Obtener Usuario Discord
    const userResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { id, email } = userResponse.data;
    console.log(userResponse.data);

    // Paso 3: Crear Usuario en DB
    const newUser = await createUser({
      id,
      email,
      token: access_token,
      refreshToken: refresh_token,
    });

    // Paso 4: Asignar Rol (debug logs incluidos)
    console.log("Asignando rol con:", { GUILD_ID, id, VERIFICATED_ROLE });

    const roleResult = await assignRoleToUser({
      guildId: GUILD_ID,
      userId: id,
      roleId: VERIFICATED_ROLE,
    });

    console.log("Resultado asignación de rol:", roleResult);

    // Paso 5: Notificación
    await PrivateChannelNotificationService.sendPrivateChannelNotification(id, "✨ Has sido registrado exitosamente en Be+!");

    // Renderizar vista
    return res.render("response", {
      success: newUser.success,
      message: newUser.message,
    });

  } catch (error) {
    console.error("❌ Error en la autenticación Discord:", error.response?.data || error.message);
    return res.status(500).send("Error al autenticar con Discord.");
  }
};

// =======================
// GOOGLE AUTH FLOW
// =======================
exports.googleRedirect = async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).send("Error: Falta el ID de usuario de Discord.");

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&response_type=code&scope=https://www.googleapis.com/auth/fitness.activity.read&access_type=offline&prompt=consent&state=${id}`;

  res.redirect(authUrl);
};

exports.googleAuth = async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state) return res.status(400).send("Error: Faltan parámetros.");

  try {
    const params = new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    });

    const tokenUrl = "https://oauth2.googleapis.com/token";
    const response = await getOAuthToken(tokenUrl, params);

    const { access_token, refresh_token } = response;

    const { addGoogleAuth } = require("../services/google/fitService");
    const authUser = await addGoogleAuth({
      token: access_token,
      refreshToken: refresh_token,
      userId: state,
    });

    await PrivateChannelNotificationService.sendPrivateChannelNotification(state, "👌 Vinculación con Google Fit completada");

    res.render("response", authUser);
  } catch (error) {
    console.error("❌ Error en la autenticación Google:", error.response?.data || error.message);
    res.status(500).send("Error al autenticar con Google.");
  }
};

