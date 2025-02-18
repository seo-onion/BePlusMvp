const { google } = require('googleapis');
require('dotenv').config();

const express = require("express");
const AuthGoogle = express();

AuthGoogle.get("/api/auth/google", (req, res) => {
  const authUrl=`https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=https://www.googleapis.com/auth/fitness.activity.read&access_type=offline&prompt=consent`;
  
  res.redirect(authUrl);
});


//! GOOGLE
AuthGoogle.get("/api/auth/google/callback", async (req, res) => {
  const code = req.query.code; 

  if (!code) return res.status(400).send("Error: No se recibió código");

  try {
      const params = new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: process.env.GOOGLE_REDIRECT_URI,
          grant_type: "authorization_code",
      });


      const tokenUrl = "https://oauth2.googleapis.com/token";

      // Hacer la petición a Google para obtener el Access Token
      const response = await fetch(tokenUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params,
      });

      const data = await response.json();

      if (data.error) {
          console.error("Error obteniendo token:", data.error);
          return res.status(500).send("Error al obtener el token.");
      }

      

      
      process.env.ACCESS_TOKEN = data.access_token
      process.env.REFRESH_TOKEN = data.refresh_token
      process.env.EXPIRES_IN = data.expires_in
      
      // Enviar tokens como respuesta
      res.json({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_in: data.expires_in,
      });

  } catch (error) {
      console.error("Error en la autenticación:", error);
      res.status(500).send("Error al autenticar con Google.");
  }
});



module.exports = AuthGoogle;

