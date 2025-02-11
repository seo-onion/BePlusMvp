const express = require("express");
const authDiscord = require("./services/authDiscord/authDiscord")
const app = express();
app.use(express.json());
app.use("/", authDiscord);

module.exports = app;