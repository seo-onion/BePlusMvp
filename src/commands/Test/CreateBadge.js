const { SlashCommandBuilder } = require("discord.js");
const { createBadges } = require("../../services/item/economyService");
const TESTER_ROLE = process.env.TESTER_ROLE;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("creardivisas")
        .setDescription("Crea las divisas en el sistema de economía."),

    async execute(interaction) {
        const member = interaction.member;

        // ✅ Validación de rol
        if (!member.roles.cache.has(TESTER_ROLE)) {
            console.log("No tienes los permisos para ejecutar este comando, no eres TESTER.");
            return await interaction.reply({
                content: "⛔ No tienes permisos para ejecutar este comando.",
                ephemeral: true
            });
        } else {
            console.log("Tienes los permisos para ejecutar este comando. ERES TESTER.");
        }

        // ✅ Deferir la interacción para evitar el error de expiración
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
        }

        try {
            await createBadges();
            console.log("✅ Divisas creadas exitosamente.");

            return await interaction.editReply({
                content: `✅ Las divisas han sido creadas correctamente.`
            });

        } catch (error) {
            console.error("❌ Error al crear las divisas:", error);

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
