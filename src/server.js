const express = require("express");
const authDiscord = require("./services/authDiscord/authDiscord")
const authGoogle = require("./services/googleFit/authGoogle")
const app = express();
const path = require('path');

app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs")

app.use(express.urlencoded ({extended: true}))
app.use(express.json());


app.use("/", authDiscord);
app.use("/", authGoogle);

app.get("/form", async (req, res) => {
    res.render("formulario", { mensaje: null, user: null });
});




module.exports = app;