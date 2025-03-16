const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('node:path');

const TOKEN = process.env.DISCORD_TOKEN;
const APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        try {
            const command = require(path.join(folderPath, file));
            
            if (!command.data || typeof command.data.toJSON !== 'function') {
                throw new Error(`❌ El comando "${file}" en la carpeta "${folder}" no tiene 'data' o 'toJSON()'.`);
            }

            const jsonCommand = command.data.toJSON();
            const commandIndex = commands.length;

            // 🔍 DEBUG: Mostrar el índice, nombre y si tiene opciones
            console.log(`🧩 Comando [${commandIndex}]: ${jsonCommand.name}`);
            if (jsonCommand.options) {
                console.log(`📦 Opciones (${jsonCommand.options.length}):`);
                jsonCommand.options.forEach((opt, idx) => {
                    console.log(`   [${idx}] Nombre: ${opt.name}, Required: ${opt.required}`);
                });
            } else {
                console.log("📭 Sin opciones");
            }

            commands.push(jsonCommand);
        } catch (error) {
            console.error(`❌ Error en el comando "${file}" en la carpeta "${folder}":`, error.message);
            process.exit(1);
        }
    }
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('Registrando comandos en Discord...');
        await rest.put(Routes.applicationCommands(APPLICATION_ID), { body: commands });
        console.log('✅ Comandos registrados exitosamente.');
    } catch (error) {
        console.error('❌ Error al registrar comandos:', error);
        process.exit(1); // Detener el proceso si hay un error en la solicitud
    }
})();
