const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getSteps, registerSteps } = require('../../services/google/fitService');
const DateHelper = require("../../utils/dateHelper");
const createErrorEmbed = require("../../utils/embed/errorEmbed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pasos")
        .setDescription("Mira la cantidad de pasos en un periodo de tiempo")
        .addStringOption(option =>
            option.setName('tiempo')
                .setDescription('Elige un período de tiempo')
                .setRequired(true)
                .addChoices(
                    { name: 'Día', value: 'day' },
                    { name: 'Semana', value: 'week' },
                    { name: 'Mes', value: 'month' }
                )
        ),

    restricted: true, // Restricts this command for specific users (like Beta Testers).

    async execute(interaction) {
        try {
            // Defers the reply to avoid timeout issues during processing.
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ flags: 64 });
            }

            const userId = interaction.user.id;
            const time = interaction.options.getString('tiempo');


            let steps;
            let timePeriod;

            // Determines the time range based on the selected option.
            if (time === 'day') {
                const { startTimeMillis, endTimeMillis } = DateHelper.getToday();

                steps = await getSteps({ startTimeMillis, endTimeMillis, userId: userId });
                console.log(steps);
                await registerSteps({ userId: userId, steps: steps });


                timePeriod = "📅 Hoy";
            } else if (time === 'week') {
                const { startTimeMillis, endTimeMillis } = DateHelper.getLastWeek();
                steps = await getSteps({ startTimeMillis, endTimeMillis, userId });
                timePeriod = "📅 Última Semana";
            } else if (time === 'month') {
                const { startTimeMillis, endTimeMillis } = DateHelper.getStartOfMonth();
                steps = await getSteps({ startTimeMillis, endTimeMillis, userId });
                timePeriod = "📅 Último Mes";
            }

            // If no steps could be retrieved, show an error message.
            if (!steps && steps != 0) {
                const errorEmbed = createErrorEmbed({
                    title: "⚠️ No se ha podido recuperar el número de pasos. Inténtalo más tarde."
                });
                return await interaction.editReply({ embeds: [errorEmbed] });
            }

            // Creates an embed displaying the user's steps information.
            const embed = new EmbedBuilder()
                .setColor("#00FF00") // 🎨 Verde llamativo
                .setTitle("🚶‍♂️ Registro de Pasos")
                .setDescription("Aquí están tus pasos acumulados en el período seleccionado:")
                .addFields(
                    { name: "⏳ Período", value: timePeriod, inline: true },
                    { name: "👣 Pasos Contados", value: `**${steps}**`, inline: true }
                )
                .setFooter({ text: "¡Sigue caminando para obtener más recompensas!" });

            return await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("❌ Error al obtener los pasos:", error);

            const errorEmbed = createErrorEmbed({
                title: "⚠️ Ocurrió un error inesperado. Intenta nuevamente más tarde."
            });

            // Checks if the interaction has been deferred or replied to avoid duplicate responses.
            if (interaction.deferred || interaction.replied) {
                return await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                return await interaction.reply({ embeds: [errorEmbed], flags: 64 });
            }
        }
    },
};
