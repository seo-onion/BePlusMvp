const { createAchievement } = require("../../services/achievement/achievementService");
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const createAlertEmbed = require("../../utils/alertEmbed");

const DEV = process.env.DEV_ROLE;
const ADMIN = process.env.ADMIN_ROLE;

const logros = [
    { name: "Racha Perfecta", description: "Lograste completar 30 días consecutivos sin fallar tu hábito. ¡Eres imparable!", emoji: "🏆", points: 100 },
    { name: "Primeros 7 Días", description: "Completaste tu primera semana. ¡Buen comienzo!", emoji: "🥇", points: 50 },
    { name: "Quincesito", description: "Mitad de camino, estás en la ruta correcta.", emoji: "🎖️", points: 75 },
    { name: "Finisher", description: "Conseguiste llegar al final del reto de 30 días. ¡Increíble dedicación!", emoji: "🥳", points: 120 },
    { name: "Primer Paso", description: "Diste tu primer paso hacia el éxito.", emoji: "👣", points: 10 },
    { name: "10k Club", description: "Caminaste más de 10,000 pasos en un solo día. ¡Qué energía!", emoji: "🚶‍♂️💨", points: 80 },
    { name: "Maratonista", description: "Alcanzaste una maratón completa con tus pasos acumulados.", emoji: "🏃‍♀️🏅", points: 150 },
    { name: "100k Walker", description: "Has sumado más de 100,000 pasos. ¡Un verdadero caminante!", emoji: "👟🌟", points: 200 }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("crearlogros")
        .setDescription("Crea todos los logros predefinidos."),

    async execute(interaction) {
        const member = interaction.member;

        // ✅ Validación de roles
        if (!member.roles.cache.has(DEV) && !member.roles.cache.has(ADMIN)) {
            const embed = createAlertEmbed("🚫 No deberías estar ejecutando este comando.");
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // ✅ Deferir la interacción para evitar errores de tiempo de espera
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
        }

        try {
            for (const logro of logros) {
                await createAchievement({
                    name: logro.name,
                    description: logro.description,
                    emoji: logro.emoji,
                    points: logro.points
                });
                console.log(`✅ Logro creado: ${logro.name}`);
            }

            console.log("✅ Todos los logros fueron insertados correctamente.");

            return await interaction.editReply({
                content: `✅ Todos los logros han sido creados correctamente.`
            });

        } catch (error) {
            console.error("❌ Error al insertar logros:", error);

            if (interaction.deferred || interaction.replied) {
                return await interaction.editReply({
                    content: "❌ Ocurrió un error al intentar crear los logros."
                });
            } else {
                return await interaction.reply({
                    content: "❌ Ocurrió un error al intentar crear los logros.",
                    ephemeral: true
                });
            }
        }
    },
};
