require("dotenv").config();
const express = require("express");
const axios = require("axios");

const AuthDiscord = express();

const DISCORD_CLIENT_ID = process.env.APPLICATION_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const BOT_TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const ROLE_ID = process.env.VERIFICATED_ROLE;

AuthDiscord.get("/api/auth/discord", (req, res) => {
  const authUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&scope=identify%20email%20guilds%20connections`;
  res.redirect(authUrl);
});

AuthDiscord.get("/api/auth/discord/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send("No se recibió el código de autorización.");
  }

  try {
    // 🔹 Intercambiar código por access_token
    const tokenResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    if (!access_token) {
      return res.status(500).json({ error: "No se pudo obtener el access_token de Discord." });
    }

    // 🔹 Obtener información del usuario
    const userResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const userData = userResponse.data;
    console.log("Usuario autenticado:", userData);

    try {
      await axios.get(`https://discord.com/api/guilds/${GUILD_ID}/members/${userData.id}`, {
        headers: { Authorization: `Bot ${BOT_TOKEN}` },
      });
      console.log("El usuario ya está en el servidor.");
    } catch (error) {
      console.log("El usuario no está en el servidor, agregándolo...");
      await axios.put(
        `https://discord.com/api/guilds/${GUILD_ID}/members/${userData.id}`,
        { access_token },
        { headers: { Authorization: `Bot ${BOT_TOKEN}`, "Content-Type": "application/json" } }
      );
    }

    // 🔹 Llamar al servicio para asignar rol
    const roleResult = await assignRoleToUser(GUILD_ID, userData.id, ROLE_ID, BOT_TOKEN);

    if (!roleResult.success) {
      return res.status(500).json({ error: "Error al asignar el rol." });
    }
    res.json({
      message: "Autenticación exitosa y rol asignado.",
      user: userData,
    });
  } catch (error) {
    console.error("Error durante la autenticación:", error.response?.data || error.message);
    res.status(500).json({ error: "Error durante la autenticación." });
  }
});

module.exports = AuthDiscord;
