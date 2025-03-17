const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const CHANNEL_ID = process.env.PUBLIC_CHANNEL;

class ChannelNotificationService {
    // Sends a notification to a specified Discord channel with an embedded message.
    static async sendChannelNotification(title, description, color = "#ffcc00") {
        try {
            const channel = await client.channels.fetch(CHANNEL_ID);

            // Check if the channel exists and is a text-based channel.
            if (!channel || !channel.isTextBased()) {
                console.error(`❌ Error: No se encontró el canal con ID ${CHANNEL_ID} o no es de texto.`);
                return;
            }

            // Create an embed and send it to the channel, mentioning everyone
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(color)
                .setTimestamp()
                .setFooter({ text: "BePlus Notificaciones", iconURL: client.user.displayAvatarURL() });

            await channel.send({ content: "@everyone 🚨 ¡Nueva Notificación!", embeds: [embed] });

            console.log(`📢 Embed enviado en el canal ${CHANNEL_ID}`);
        } catch (error) {
            console.error("❌ Error enviando mensaje al canal:", error.message);
        }
    }
}

// Log the bot into Discord using the provided token.
client.login(process.env.TOKEN);

module.exports = ChannelNotificationService;
