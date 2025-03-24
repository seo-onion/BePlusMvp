const createAlertEmbed = require("./embed/alertEmbed");

module.exports = async function verification(member, rol, message, interaction, rol2 = rol, embedFunction = createAlertEmbed, createErrorEmbed) {
    rol2 = rol2 || rol; // Ensuring rol2 defaults to rol

    if (!member.roles.cache.has(rol) && !member.roles.cache.has(rol2)) {
        const embed = embedFunction(message);
        await interaction.reply({ embeds: [embed], ephemeral: true }); // Use await to properly handle interaction.reply
        return true; // Indicating failure (user lacks the role)
    }

    console.log(`✅ User ${member.user.tag} has the required role(s) and can execute the command.`);
    return false; // Indicating success (user has the role)
};
