const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('node:path');

const TOKEN = process.env.TOKEN;
const APPLICATION_ID = process.env.APPLICATION_ID;

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
                throw new Error(`❌ The command "${file}" in the folder "${folder}" does not have 'data' or 'toJSON()'.`);
            }

            // Add the valid command to the commands array.
            commands.push(command.data.toJSON());

        } catch (error) {
            console.error(`❌ Error in the command "${file}" in the folder "${folder}":`, error.message);
            process.exit(1); // Terminate process if an error occurs.
        }
    }
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('Registering commands to Discord...');
        await rest.put(Routes.applicationCommands(APPLICATION_ID), { body: commands });
        console.log('✅ Commands registered successfully.');
    } catch (error) {
        console.error('❌ Error while registering commands:', error);
        process.exit(1); // Terminate process if registration fails.
    }
})();
