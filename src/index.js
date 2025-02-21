const app = require("./server")
const client = require("./bot");
const {sequelize} = require("./config/database")

async function main() {
  try {
    
    console.log("⏳ Conectando a la base de datos...");
    await sequelize.authenticate();
    console.log("✅ Base de datos conectada.");

    console.log("⏳ Sincronizando modelos...");
    await sequelize.sync({ alter: true }); // ⚠️ Usa `alter: true` para actualizar sin borrar datos
    console.log("✅ Modelos sincronizados.");


    // Run server
    app.listen(3000, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:3000`);
    });
    
    // Run bot
    if (!client.isReady()) {
      client.login(process.env.TOKEN);
    }

  } catch (error){ 
    console.error(error)
  }
}

main();