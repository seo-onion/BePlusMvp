const path = require('path');
const dotenv = require('dotenv');

// Load .env production or development
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(__dirname, `../config/dotenv/${envFile}`) });
// Load global environment variables
dotenv.config({ path: path.resolve(__dirname, '../config/dotenv/.env') });

const express = require("express");
const { sequelize } = require("./config/database");
const { execSync } = require("child_process");
const client = require("./bot");
const app = express();

// Import authentication and user service controllers.
const {
  discordRedirect,
  discordAuth,
  googleRedirect,
  googleAuth,
} = require("./controller/AuthController");

const { editUser } = require("./services/user/userService");

// View settings
app.set("views", path.join(__dirname, "./views"));
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

// Execute deploy-commands before starting the server
async function deployCommands() {
  try {
    console.log("Executing command deployment in Discord...");
    execSync('node src/deploy-commands.js', { stdio: 'inherit' });
    console.log("Commands registered successfully.");
  } catch (error) {
    console.error("Error executing deploy-commands.js:", error.message);
    process.exit(1); // Exit if there is an error in the deployment
  }
}


// Main function to initialize database, server, and Discord bot.
async function main() {
  try {
    // Execute before starting the server
    await deployCommands();

    console.log(`Environment: ${process.env.NODE_ENV}`);

    await sequelize.authenticate();
    console.log("Connected database.");

    await sequelize.sync({ alter: true });
    console.log("Synchronized models.");

    const PORT = process.env.PORT || 3000;
    const HOST = process.env.DB_HOST || "127.0.0.1";

    // Start the server and listen on all network interfaces for Render at port 0.0.0.0.
    app.listen(PORT, HOST, () => {
      console.log(`Server running in http://${HOST}:${PORT}`);
    });

    // Deploy discord bot
    if (!client.isReady()) {
      await client.login(process.env.TOKEN);
    }
  } catch (error) {
    console.error("Error to execute: ", error);
  }
}

main();
