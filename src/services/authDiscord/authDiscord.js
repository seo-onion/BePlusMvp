require("dotenv").config();
const express = require("express");
const axios = require("axios");
const AuthDiscord = express();
const {createUser} = require("../user/User");
const DISCORD_CLIENT_ID = process.env.APPLICATION_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

AuthDiscord.get("/api/auth/discord", (req, res) => {
  const authUrl = `https://discord.com/oauth2/authorize?client_id=${process.env.APPLICATION_ID}&response_type=code&redirect_uri=${process.env.DISCORD_REDIRECT_URI}&scope=identify+email+guilds+connections`;
  res.redirect(authUrl);
});

//! DISCORD
AuthDiscord.get("/api/auth/discord/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send("No se recibió el código de autorización.");
  }

  try {
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

    const userResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const userData = userResponse.data;

    const result = await createUser({
      data: userData,
      token: { access_token, refresh_token },
    });

    res.status(result.success ? 201 : 200).json(result);
  } catch (error) {
    console.error("Error durante la autenticación:", error.message);
    res.status(500).json({ error: "Error durante la autenticación." });
  }
});

module.exports = AuthDiscord;
