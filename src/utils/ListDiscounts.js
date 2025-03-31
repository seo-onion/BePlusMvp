const padEndNumber = 15;

module.exports = function ListDiscountsFormat(objectList, errorMessage = "Mensaje por defecto") {
    return objectList.length > 0
        ? `\`\`\`css\n${
            objectList.map(i => {
                const price = i.price !== undefined ? `💎${i.price}` : "N/A";
                const discount = i.discount !== undefined ? `${i.discount}%` : "";
                return `• ${price.padEnd(6)} - ${i.name.padEnd(padEndNumber)} ${discount}`;
            }).join("\n")
        }\n\`\`\``
        : errorMessage;
}
