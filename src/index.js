const app = require("./server")
const client = require("./bot");
const {sequelize} = require("./config/database")

const User = require("./models/User")
async function main() {
  try {
    
    await sequelize.sync({force: true})

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

