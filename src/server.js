const express = require("express");
const app = express();
const path = require('path');
require("dotenv").config();

const {
  discordRedirect,
  discordAuth,
  googleRedirect,
  googleAuth,
} = require("./controller/AuthController");
const { editUser } = require("./services/user/userService");

// Configuración de vistas
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rutas
app.get("/api/auth/discord", discordRedirect);
app.get("/api/auth/discord/callback", discordAuth);

app.get("/api/auth/google", googleRedirect);
app.get("/api/auth/google/callback", googleAuth);

app.get("/form", async (req, res) => {
  res.render("formulario", { mensaje: null, user: null });
});

app.post("/api/auth/discord/update-user", editUser);

module.exports = app;
