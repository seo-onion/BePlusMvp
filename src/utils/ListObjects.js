const padEndNumber = 15;
module.exports = function ListObjectsFormat(objectList, errorMessage = "Mensaje por defecto") {
    return objectList.length > 0
        ? `\`\`\`css\n${objectList.map(i => `• ${i.name.padEnd(padEndNumber)} ${i.price} 🪙`).join("\n")}\n\`\`\``
        : errorMessage;
}