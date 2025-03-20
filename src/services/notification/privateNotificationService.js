const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const createErrorEmbed = require("../../utils/embed/errorEmbed"); 

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers]
});

const CHANNEL_ID = process.env.DISCORD_PRIVATE_CHANNEL;

class PrivateChannelNotificationService {
    static async sendPrivateChannelNotification(userId, message) {
        try {
            const channel = await client.channels.fetch(CHANNEL_ID);
            if (!channel || !channel.isTextBased()) {
                console.error(`Channel with ID ${CHANNEL_ID} not found or is not text.`)
                return;
            }

            const member = await channel.guild.members.fetch(userId);
            if (!member) {
                console.error(`User with ID ${userId} not found`);
                return;
            }

            // Create notification embed
            const notificationEmbed = new EmbedBuilder()
                .setColor("#00AEEF")
                .setTitle("📩 Nueva Notificación")
                .setDescription(message)
                .setFooter({ text: `Enviado para: ${member.user.tag}` })
                .setTimestamp();

            // send embed as notification
            const msg = await channel.send({
                embeds: [notificationEmbed],
            });

            // Set permissions to hide the message from everyone except the user
            await msg.channel.permissionOverwrites.create(channel.guild.roles.everyone, { ViewChannel: false });
            await msg.channel.permissionOverwrites.create(userId, { ViewChannel: true });

            console.log(`Private notification sent on channel ${CHANNEL_ID} visible only to ${member.user.tag}`);
        } catch (error) {
            const errorEmbed = createAlertEmbed({description: `Tuvimos un error al enviarte esta notificacion: ${error.message}`});
            console.error(error);
        }
    }
}

client.login(process.env.TOKEN);

module.exports = PrivateChannelNotificationService;