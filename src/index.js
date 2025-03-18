const path = require('path');
const dotenv = require('dotenv');
// Load .env production or development
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(__dirname, `../config/dotenv/${envFile}`) });

// Load global environment variables
dotenv.config({ path: path.resolve(__dirname, '../config/dotenv/.env') });

const express = require("express");
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

// Execute deploy-commands before to start the server
async function deployCommands() {
  try {
    console.log("🚀 Ejecutando despliegue de comandos en Discord...");
    execSync('node src/deploy-commands.js', { stdio: 'inherit' });
    console.log("✅ Comandos registrados exitosamente.");
  } catch (error) {
    console.error("❌ Error al ejecutar deploy-commands.js:", error.message);
    process.exit(1); // Salir si hay error en el despliegue
  }
}


// Execute deploy-commands before to start the server
async function deployCommands() {
  try {
    console.log("🚀 Ejecutando despliegue de comandos en Discord...");
    execSync('node src/deploy-commands.js', { stdio: 'inherit' });
    console.log("✅ Comandos registrados exitosamente.");
  } catch (error) {
    console.error("❌ Error al ejecutar deploy-commands.js:", error.message);
    process.exit(1); // Salir si hay error en el despliegue
  }
}

// Main function to initialize database, server, and Discord bot.
async function main() {
  try {
    //Execute before to start server
    await deployCommands();

    //Execute before to start server
    await deployCommands();

    console.log(`Environment: ${process.env.NODE_ENV}`);

    console.log("⏳ Conectando a la base de datos...");
    await sequelize.authenticate();
    console.log("✅ Base de datos conectada.");

    console.log("⏳ Sincronizando modelos...");
    await sequelize.sync({ alter: true });
    console.log("✅ Modelos sincronizados.");

    const PORT = process.env.PORT || 3000;
    const HOST = process.env.DB_HOST || "127.0.0.1";

    // Start the server and listen on all network interfaces for Render at port 0.0.0.0.
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Servidor corriendo en http://${HOST}:${PORT}`);
    });

    // Deploy discord bot
    if (!client.isReady()) {
      await client.login(process.env.TOKEN);
    }
  } catch (error) {
    console.error("❌ Error en la aplicación:", error);
  }
}

main();