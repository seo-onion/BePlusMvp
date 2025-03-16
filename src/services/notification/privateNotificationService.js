const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const createAlertEmbed = require("../../utils/embed/alertEmbed"); 

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers]
});

const CHANNEL_ID = process.env.PRIVATE_CHANNEL;

class PrivateChannelNotificationService {
    static async sendPrivateChannelNotification(userId, message) {
        try {
            const channel = await client.channels.fetch(CHANNEL_ID);
            if (!channel || !channel.isTextBased()) {
                const errorEmbed = createAlertEmbed(`❌ Error: No se encontró el canal con ID ${CHANNEL_ID} o no es de texto.`);
                console.error(errorEmbed.data.description);
                return;
            }

            const member = await channel.guild.members.fetch(userId);
            if (!member) {
                const errorEmbed = createAlertEmbed(`❌ Error: No se encontró el usuario con ID ${userId}`);
                console.error(errorEmbed.data.description);
                return;
            }

            // ✅ Crear embed de notificación
            const notificationEmbed = new EmbedBuilder()
                .setColor("#00AEEF")
                .setTitle("📩 Nueva Notificación")
                .setDescription(message)
                .setFooter({ text: `Enviado para: ${member.user.tag}` })
                .setTimestamp();

            // ✅ Enviar el mensaje con el embed
            const msg = await channel.send({
                embeds: [notificationEmbed],
            });

            // ✅ Establecer permisos para ocultar el mensaje a todos menos al usuario
            await msg.channel.permissionOverwrites.create(channel.guild.roles.everyone, { ViewChannel: false });
            await msg.channel.permissionOverwrites.create(userId, { ViewChannel: true });

            console.log(`📩 Notificación privada enviada en el canal ${CHANNEL_ID} visible solo para ${member.user.tag}`);
        } catch (error) {
            const errorEmbed = createAlertEmbed(`❌ Error enviando mensaje privado en el canal: ${error.message}`);
            console.error(errorEmbed.data.description);
        }
    }
}

client.login(process.env.TOKEN);

module.exports = PrivateChannelNotificationService;
