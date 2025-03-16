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
        try {
            const command = require(path.join(folderPath, file));
            
            if (!command.data || typeof command.data.toJSON !== 'function') {
                throw new Error(`The command "${file}" in the folder "${folder}" is missing 'data' or 'toJSON()'.`);
            }

            commands.push(command.data.toJSON());
        } catch (error) {
            console.error(`Error in the command "${file}" in the folder "${folder}":`, error.message);
            process.exit(1); // Stop error proccess
        }
    }
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('Registering commands in Discord...');
        await rest.put(Routes.applicationCommands(APPLICATION_ID), { body: commands });
        console.log('Commands registered successfully.');
    } catch (error) {
        console.error('Error registering commands:', error);
        process.exit(1); 
    }
})();
