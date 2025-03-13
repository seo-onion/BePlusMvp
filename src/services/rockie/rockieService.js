const { createCanvas, loadImage } = require("canvas");
const path = require("path");
const fs = require("fs");
const Rockie = require("../../models/Rockie/Rockie");

// 📌 Función para obtener el Rockie de un usuario
async function getRockie(userId) {
    return await Rockie.findOne({ where: { id: userId } });
}

// 📌 Crear un nuevo Rockie si el usuario no tiene uno
async function createRockie(userId, username) {
    const existingRockie = await getRockie(userId);
    if (existingRockie) return existingRockie;

    // ✅ Usar nombres de carpetas sin 'c'
    const colors = ["1", "2", "3", "4", "5", "6"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newRockie = await Rockie.create({
        id: userId,
        name: username,
        level: 1,
        color: randomColor,
        skinItem: "1.png",
        hatItem: null,
        clothesItem: null,
        experience: 0,
    });

    return newRockie;
}

// 📌 Función para subir de nivel a Rockie
async function levelUpRockie(userId) {
    const rockie = await getRockie(userId);
    if (!rockie) return null;

    // Máximo nivel 4 (porque hay 4 imágenes por color)
    const newLevel = Math.min(rockie.level + 1, 4);
    await rockie.update({ level: newLevel });

    return rockie;
}

// 📌 Generar la imagen de Rockie en cada ejecución sin usar caché local
async function renderRockie(userId) {
    const rockie = await getRockie(userId);
    if (!rockie) return null;

    const { color, level, hatItem, clothesItem } = rockie;
    const basePath = path.join(__dirname, "../../images/rockie/");
    const rockieBasePath = path.join(basePath, "colores", color, `${level}.png`);
    const hatPath = hatItem ? path.join(basePath, "conjuntos", hatItem) : null;
    const clothesPath = clothesItem ? path.join(basePath, "conjuntos", `${clothesItem}.png`) : null;

    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext("2d");

    try {
        // Cargar imagen base
        const baseImage = await loadImage(rockieBasePath);
        ctx.drawImage(baseImage, 0, 0, 512, 512);

        // Cargar ropa si existe
        if (clothesPath && fs.existsSync(clothesPath)) {
            const clothesImage = await loadImage(clothesPath);
            ctx.drawImage(clothesImage, 0, 0, 512, 512);
        }

        // Cargar sombrero si existe
        if (hatPath && fs.existsSync(hatPath)) {
            const hatImage = await loadImage(hatPath);
            ctx.drawImage(hatImage, 0, 0, 512, 512);
        }

        // Retornar la imagen generada
        return canvas.toBuffer("image/png");

    } catch (error) {
        console.error(`❌ Error cargando la imagen:`, error);
        throw error;
    }
}

module.exports = {
    getRockie,
    createRockie,
    levelUpRockie,
    renderRockie,
};
