const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.DISCORD_TOKEN;
const APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;

if (!TOKEN || !APPLICATION_ID) {
    console.error('DISCORD_TOKEN o DISCORD_APPLICATION_ID no están definidos en las variables de entorno.');
    process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

// Iterate over each folder in the 'commands' directory.
for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    // Process each command file within the current folder.
    for (const file of commandFiles) {
        try {
            const command = require(path.join(folderPath, file));
            // Validate if the command has the required 'data' and 'toJSON' method.
            if (!command.data || typeof command.data.toJSON !== 'function') {
                throw new Error(`The command "${file}" in the folder "${folder}" is missing 'data' or 'toJSON()'.`);
            }

            // Add the valid command to the commands array.
            commands.push(command.data.toJSON());
            console.log(`Comando cargado: ${command.data.name}`);
        } catch (error) {
            console.error(`Error en el comando "${file}" en la carpeta "${folder}":`, error.message);
            process.exit(1);
        }
    }
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('Registering commands to Discord...');
        await rest.put(Routes.applicationCommands(APPLICATION_ID), { body: commands });
        console.log('Comandos registrados exitosamente.');
        process.exit(0);
    } catch (error) {
        console.error('Error registrando comandos:', error);
        process.exit(1); 
    }
})();
