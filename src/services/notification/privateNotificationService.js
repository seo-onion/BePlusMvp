const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const createAlertEmbed = require("../../utils/alertEmbed");

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers]
});

const CHANNEL_ID = process.env.PRIVATE_CHANNEL;

class PrivateChannelNotificationService {
    // Sends a private notification to a specified user in a given channel.
    static async sendPrivateChannelNotification(userId, message) {
        try {
            // Fetch the private channel.
            const channel = await client.channels.fetch(CHANNEL_ID);
            if (!channel || !channel.isTextBased()) {
                const errorEmbed = createAlertEmbed(`❌ Error: No se encontró el canal con ID ${CHANNEL_ID} o no es de texto.`);
                console.error(errorEmbed.data.description);
                return;
            }

            // Fetch the guild member by user ID.
            const member = await channel.guild.members.fetch(userId);
            if (!member) {
                const errorEmbed = createAlertEmbed(`❌ Error: No se encontró el usuario con ID ${userId}`);
                console.error(errorEmbed.data.description);
                return;
            }

            // Create the notification embed and send the message in the private channel.
            const notificationEmbed = new EmbedBuilder()
                .setColor("#00AEEF")
                .setTitle("📩 Nueva Notificación")
                .setDescription(message)
                .setFooter({ text: `Enviado para: ${member.user.tag}` })
                .setTimestamp();

            const msg = await channel.send({
                embeds: [notificationEmbed],
            });

            // Set channel permissions to make the message visible only to the specified user.
            await msg.channel.permissionOverwrites.create(channel.guild.roles.everyone, { ViewChannel: false });
            await msg.channel.permissionOverwrites.create(userId, { ViewChannel: true });

            console.log(`📩 Notificación privada enviada en el canal ${CHANNEL_ID} visible solo para ${member.user.tag}`);
        } catch (error) {
            const errorEmbed = createAlertEmbed(`❌ Error enviando mensaje privado en el canal: ${error.message}`);
            console.error(errorEmbed.data.description);
        }
    }
}

// Log the bot into Discord using the provided token.
client.login(process.env.TOKEN);

module.exports = PrivateChannelNotificationService;
