const { SlashCommandBuilder } = require("discord.js");
const { getSteps } = require('../../services/google/fitService');
const ROLE_ID = process.env.TESTER_ROLE;

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
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true }); // 🟢 Asegura que la respuesta sea diferida

        const member = interaction.member;
        const id = interaction.user.id;
        const time = interaction.options.getString('tiempo');

        console.log(`Usuario: ${id} pidió pasos para ${time}`);

        if (!member.roles.cache.has(ROLE_ID)) {
            return interaction.editReply({ content: '⛔ Espera a que terminemos de verificarte antes.', ephemeral: true });
        }

        try {
            let steps;
            const now = Date.now();
            if (time === 'day') {
                steps = await getSteps({ startTimeMillis: now - 86400000, endTimeMillis: now, userId: id });
            } else if (time === 'week') {
                steps = await getSteps({ startTimeMillis: now - (86400000 * 7), endTimeMillis: now, userId: id });
            } else if (time === 'month') {
                steps = await getSteps({ startTimeMillis: now - (86400000 * 31), endTimeMillis: now, userId: id });
            }

            if (!steps || !steps.message) {
                throw new Error("No se pudieron obtener los pasos.");
            }

            return await interaction.editReply({ content: `🚶‍♂️ **Pasos registrados en el período seleccionado:** ${steps.message}`, ephemeral: true });

        } catch (error) {
            console.error("Error al obtener los pasos:", error);
            return interaction.editReply({ content: "❌ Ocurrió un error al obtener los pasos. Inténtalo más tarde.", ephemeral: true });
        }
    },
};
