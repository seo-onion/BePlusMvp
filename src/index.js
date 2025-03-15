const express = require("express");
const path = require("path");
const { sequelize } = require("./config/database");
const client = require("./bot");
require("dotenv").config();

const app = express();

// Import authentication and user service controllers.
const {
  discordRedirect,
  discordAuth,
  googleRedirect,
  googleAuth,
} = require("./controller/AuthController");

const { editUser } = require("./services/user/userService");

// Configure view engine and views directory.
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

// Middleware for parsing incoming request bodies.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Define authentication routes for Discord and Google.
app.get("/api/auth/discord", discordRedirect);
app.get("/api/auth/discord/callback", discordAuth);

app.get("/api/auth/google", googleRedirect);
app.get("/api/auth/google/callback", googleAuth);

// Route to render the user form.
app.get("/form", async (req, res) => {
  res.render("formulario", { mensaje: null, user: null });
});

// Route to handle user data updates from Discord.
app.post("/api/auth/discord/update-user", editUser);

// Main function to initialize database, server, and Discord bot.
async function main() {
  try {
    console.log("⏳ Conectando a la base de datos...");
    await sequelize.authenticate();
    console.log("✅ Base de datos conectada.");

    console.log("⏳ Sincronizando modelos...");
    await sequelize.sync({ alter: true });
    console.log("✅ Modelos sincronizados.");

    const PORT = process.env.PORT || 8080;

    // Start the server and listen on all network interfaces for Render at port 0.0.0.0.
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
    });

    // Ensure the Discord bot is logged in and execute it.
    if (!client.isReady()) {
      client.login(process.env.TOKEN);
    }
  } catch (error) {
    console.error("❌ Error en la aplicación:", error);
  }
}

main();