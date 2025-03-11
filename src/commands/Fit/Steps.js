const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getSteps, registerSteps } = require('../../services/google/fitService');
const DateHelper = require("../../utils/dateHelper");
const createErrorEmbed = require("../../utils/errorEmbed");

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

    restricted: true, // ✅ Se restringe el comando para que solo Beta Testers lo usen

    async execute(interaction) {
        try {
            // ✅ Defer la respuesta solo si no ha sido deferida o respondida
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply({ flags: 64 });
            }

            const userId = interaction.user.id;
            const time = interaction.options.getString('tiempo');

            console.log(`📌 Usuario ${userId} solicitó pasos para: ${time}`);

            let steps;
            let timePeriod;

            // ⏳ Obtener el rango de tiempo según la opción seleccionada
            if (time === 'day') {
                const { startTimeMillis, endTimeMillis } = DateHelper.getToday();

                steps = await getSteps({ startTimeMillis, endTimeMillis, userId: id });
                console.log(steps);
                await registerSteps({ userId: id, steps: steps });


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

            // 🚨 Si no se pudieron obtener los pasos, mostrar error
            if (!steps) {
                const errorEmbed = createErrorEmbed("⚠️ No se ha podido recuperar el número de pasos. Inténtalo más tarde.");
                return await interaction.editReply({ embeds: [errorEmbed] });
            }

            // 🎨 Crear el embed con la información de pasos
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

            const errorEmbed = createErrorEmbed("⚠️ Ocurrió un error inesperado. Intenta nuevamente más tarde.");

            // ✅ Verificar si la interacción ya fue deferida o respondida
            if (interaction.deferred || interaction.replied) {
                return await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                return await interaction.reply({ embeds: [errorEmbed], flags: 64 });
            }
        }
    },
};
