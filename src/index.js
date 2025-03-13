const app = require("./server");
const client = require("./bot");
const { sequelize } = require("./config/database");

async function main() {
  try {
    console.log("⏳ Conectando a la base de datos...");
    await sequelize.authenticate();
    console.log("✅ Base de datos conectada.");

    console.log("⏳ Sincronizando modelos...");
    await sequelize.sync({ alter: true });
    console.log("✅ Modelos sincronizados.");

    const PORT = process.env.PORT || 8080;

    // ✅ Cambiado de localhost a 0.0.0.0
    app.listen(PORT, '0.0.0.0', () => {
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
