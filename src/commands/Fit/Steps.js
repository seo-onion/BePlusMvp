const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getSteps, registerSteps } = require('../../services/google/fitService');
const DateHelper = require("../../utils/dateHelper")
const createErrorEmbed = require("../../utils/errorEmbed")
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
        await interaction.deferReply({ ephemeral: true }); // 🟢 Respuesta diferida

        const member = interaction.member;
        const id = interaction.user.id;
        const time = interaction.options.getString('tiempo');
        

        console.log(`Usuario: ${id} pidió pasos para ${time}`);

        if (!member.roles.cache.has(ROLE_ID)) {
            return interaction.editReply({ content: '⛔ Espera a que terminemos de verificarte antes.', ephemeral: true });
        }

        try {
            let steps;
            let timePeriod;

            if (time === 'day') {
                const { startTimeMillis, endTimeMillis } = DateHelper.getToday();
                steps = await getSteps({ startTimeMillis, endTimeMillis, userId: id });
                console.log(steps);
                await registerSteps({ userId: id, steps: steps });

                timePeriod = "📅 Hoy";
            } else if (time === 'week') {
                const { startTimeMillis, endTimeMillis } = DateHelper.getLastWeek();
                steps = await getSteps({ startTimeMillis, endTimeMillis, userId: id });
                timePeriod = "📅 Última Semana";
            } else if (time === 'month') {
                const { startTimeMillis, endTimeMillis } = DateHelper.getStartOfMonth();
                steps = await getSteps({ startTimeMillis, endTimeMillis, userId: id });
                timePeriod = "📅 Último Mes";
            }

            if (!steps) {
                const errorEmbed = createErrorEmbed("No se ha podido recuperar el numero de pasos"); 
                return interaction.editReply({ embeds: [errorEmbed] });
            }

            const embed = new EmbedBuilder()
                .setColor("#00FF00") // Verde llamativo
                .setTitle("🚶‍♂️ Registro de Pasos")
                .setDescription(`Aquí están tus pasos acumulados en el período seleccionado:`)
                .addFields(
                    { name: "⏳ Período", value: timePeriod, inline: true },
                    { name: "👣 Pasos Contados", value: `**${steps}**`, inline: true }
                )
                .setFooter({ text: "¡Sigue caminando para obtener más recompensas!" });
            
                
            return await interaction.editReply({ embeds: [embed] }); 


        } catch (error) {
            console.error("Error al obtener los pasos:", error);
            const errorEmbed = createErrorEmbed(error.message); 
            return interaction.editReply({ embeds: [errorEmbed] });

        }
    },
};
