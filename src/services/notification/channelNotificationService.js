const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const CHANNEL_ID= process.env.PUBLIC_CHANNEL

class ChannelNotificationService {
    static async sendChannelNotification(title, description, color = "#ffcc00") {
        try {
            const channel = await client.channels.fetch(CHANNEL_ID);
            if (!channel || !channel.isTextBased()) {
                console.error(`❌ Error: No se encontró el canal con ID ${CHANNEL_ID} o no es de texto.`);
                return;
            }


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


client.login(process.env.TOKEN);

module.exports = ChannelNotificationService;
