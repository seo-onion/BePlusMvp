const { SlashCommandBuilder } = require("discord.js");
const { createBadges } = require("../../services/item/economyService");
const TESTER_ROLE = process.env.TESTER_ROLE;
const verification = require("../../utils/verification")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("creardivisas")
        .setDescription("Crea las divisas en el sistema de economía."),

    async execute(interaction) {
        const member = interaction.member;

        // Role validation: Checks if the user has the required TESTER role to execute the command.
        if (await verification(member, TESTER_ROLE, "🚫 No deberías estar probando estos comandos.", interaction, rol, createAlertEmbed, createErrorEmbed)){
            return; // Stops execution if verification fails
        }

        // Interaction defer: Defers the reply to avoid timeout issues.
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
        }

        try {
            // Badge creation: Calls the service to create currency badges.
            await createBadges();
            console.log("✅ Currencies created successfully.");

            // Success response: Notifies the user that the currencies were successfully created.
            return await interaction.editReply({
                content: `✅ Las divisas han sido creadas correctamente.`
            });

        } catch (error) {
            // Error logging: Logs any error encountered during the creation process.
            console.error("❌ Error while creating currencies:", error);

            // Error response: Provides feedback to the user about the error, depending on the interaction state.
            if (interaction.deferred || interaction.replied) {
                return await interaction.editReply({
                    content: "❌ Ocurrió un error al intentar crear las divisas."
                });
            } else {
                return await interaction.reply({
                    content: "❌ Ocurrió un error al intentar crear las divisas.",
                    ephemeral: true
                });
            }
        }
    },
};