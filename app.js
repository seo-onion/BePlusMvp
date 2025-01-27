const path = require('node:path');
const fs = require('fs');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
require('dotenv').config();

const TOKEN = process.env.TOKEN;

// Crear una instancia del cliente de Discord
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Crear una colección para los comandos
client.commands = new Collection();

// Cargar los comandos desde la carpeta `commands`
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);

        if (command.data && command.execute) {
            client.commands.set(command.data.name, command);
        } else {
            console.warn(`El archivo ${filePath} no tiene propiedades "data" o "execute".`);
        }
    }
}

// Evento cuando el bot está listo
client.once(Events.ClientReady, readyClient => {
    console.log(`¡Listo! Iniciado sesión como ${readyClient.user.tag}`);
});

// Evento para manejar interacciones de comandos
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No se encontró un comando para ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Hubo un error al ejecutar este comando.', ephemeral: true });
    }
});

// Iniciar sesión con el token
client.login(TOKEN);


















































// require('dotenv').config();
// const express = require('express');
// const bodyParser = require('body-parser');
// const GoogleFit = require('./googleFit/googleFit');

// const app = express();
// app.use(bodyParser.json());

// // Cargar las credenciales desde .env
// const CLIENT_ID = process.env.CLIENT_ID;
// const CLIENT_SECRET = process.env.CLIENT_SECRET;
// const REDIRECT_URI = 'http://localhost:3000/auth/google/callback';

// // Crear una instancia de GoogleFit
// const googleFit = new GoogleFit(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// // Ruta para generar la URL de autenticación
// app.get('/auth/google', (req, res) => {
//   const url = googleFit.getAuthUrl();
//   res.redirect(url); // Redirige al usuario a Google para autenticarse
// });

// // Ruta de callback para recibir el código de Google
// app.get('/auth/google/callback', async (req, res) => {
//   const code = req.query.code;
//   try {
//     const tokens = await googleFit.getAccessToken(code);
//     res.send(`Google Fit connected successfully! Access Token: ${tokens.access_token}`);
//   } catch (error) {
//     console.error('Error during authentication:', error);
//     res.status(500).send('Error during authentication');
//   }
// });

// // Ruta para obtener pasos de Google Fit
// app.get('/steps', async (req, res) => {
//   try {
//     // Define el rango de fechas para los datos
//     const startDate = new Date(new Date().setDate(new Date().getDate() - 7)); // Últimos 7 días
//     const endDate = new Date();

//     const steps = await googleFit.getSteps(startDate, endDate);
//     res.json({ steps });
//   } catch (error) {
//     console.error('Error fetching steps:', error);
//     res.status(500).send('Error fetching steps');
//   }
// });

// Iniciar el servidor
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });



// const { sequelize } = require("./models/bd");

// (async () => {
//   try {
//     await sequelize.sync({ alter: true }); 
//     console.log("Tablas sincronizadas correctamente.");
//   } catch (error) {
//     console.error("Error al sincronizar las tablas:", error);
//   }
// })();

// const cron = require('node-cron');

// cron.schedule('*/15 * * * *', async () => {
//   console.log('Fetching data from Google Fit...');
//   try {
//     const steps = await getStepsFromGoogleFit();
//     // Aquí podrías enviar los datos al bot de Discord
//     console.log('Steps fetched:', steps);
//   } catch (error) {
//     console.error('Error fetching steps:', error);
//   }
// });


