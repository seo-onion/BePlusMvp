const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('node:path');

const TOKEN = process.env.TOKEN;
const APPLICATION_ID = process.env.APPLICATION_ID;

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(path.join(folderPath, file));
        commands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('Registrando comandos en Discord...');
        await rest.put(Routes.applicationCommands(APPLICATION_ID), { body: commands });
        console.log('Comandos registrados exitosamente.');
    } catch (error) {
        console.error(error);
    }
})();