const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const CHANNEL_ID = process.env.PUBLIC_CHANNEL

class ChannelNotificationService {
    static async sendChannelNotification(title, description, color = "#ffcc00") {
        try {
            const channel = await client.channels.fetch(CHANNEL_ID);
            if (!channel || !channel.isTextBased()) {
                console.error(`The channel with ID ${CHANNEL_ID} was not found or is not text.`);
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(color)
                .setTimestamp()
                .setFooter({ text: "BePlus Notificaciones", iconURL: client.user.displayAvatarURL() });


            await channel.send({ content: "@everyone 🚨 ¡Nueva Notificación!", embeds: [embed] });

            console.log(`Embed sent in channel ${CHANNEL_ID}`);
        } catch (error) {
            console.error("Error send message to channel:", error.message);
        }
    }
}

if (process.env.NODE_ENV !== 'test') {
    client.login(process.env.TOKEN);
}

module.exports = ChannelNotificationService;
