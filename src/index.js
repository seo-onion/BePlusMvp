const express = require("express");
const path = require('path');
const dotenv = require('dotenv');
// Load .env production or development
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(__dirname, `../config/dotenv/${envFile}`) });

// Load global environment variables
dotenv.config({ path: path.resolve(__dirname, '../config/dotenv/.env') });


const { sequelize } = require("./config/database");
const client = require("./bot");
const app = express();

const {
  discordRedirect,
  discordAuth,
  googleRedirect,
  googleAuth,
} = require("./controller/AuthController");

const { editUser } = require("./services/user/userService");

// Vies settings
app.set("views", path.join(__dirname, "./views"));
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

// Inicialización de la aplicación
async function main() {
  try {
    console.log(`Environment: ${process.env.NODE_ENV}`);

    console.log("⏳ Conectando a la base de datos...");
    await sequelize.authenticate();
    console.log("✅ Base de datos conectada.");

    console.log("⏳ Sincronizando modelos...");
    await sequelize.sync({ alter: true });
    console.log("✅ Modelos sincronizados.");

    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || "127.0.0.1";

    app.listen(PORT, HOST, () => {
      console.log(`🚀 Servidor corriendo en http://${HOST}:${PORT}`);
    });

    // Ejecutar el bot de Discord
    if (!client.isReady()) {
      await client.login(process.env.TOKEN);
    }

  } catch (error) {
    console.error("❌ Error en la aplicación:", error);
  }
}

main();
