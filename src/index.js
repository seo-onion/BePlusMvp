const express = require("express");
const path = require("path");
const { sequelize } = require("./config/database");
const client = require("./bot");
require("dotenv").config();

const app = express();

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

// Inicialización de la aplicación
async function main() {
  try {
    console.log("⏳ Conectando a la base de datos...");
    await sequelize.authenticate();
    console.log("✅ Base de datos conectada.");

    console.log("⏳ Sincronizando modelos...");
    await sequelize.sync({ alter: true });
    console.log("✅ Modelos sincronizados.");

    const PORT = process.env.PORT || 10000;

    // Escuchar en 0.0.0.0 para Render
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
    });

    // Ejecutar el bot de Discord
    if (!client.isReady()) {
      client.login(process.env.TOKEN);
    }

  } catch (error) {
    console.error("❌ Error en la aplicación:", error);
  }
}

main();
