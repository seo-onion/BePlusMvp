const express = require("express");
const app = express();
const path = require('path');

const {discordRedirect, discordAuth, googleRedirect, googleAuth} = require("./controller/AuthController")


app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs")

app.use(express.urlencoded ({extended: true}))
app.use(express.json());


app.get("/api/auth/discord", discordRedirect);
app.get("/api/auth/discord/callback", discordAuth);

app.get("/api/auth/google", googleRedirect);
app.get("/api/auth/google/callback", googleAuth);



app.get("/form", async (req, res) => {
    res.render("formulario", { mensaje: null, user: null });
});




module.exports = app;