const { createCanvas, loadImage } = require("canvas");
const path = require("path");
const Rockie = require("../../models/Rockie/Rockie");

// 📌 Función para obtener el Rockie de un usuario
async function getRockie(userId) {
    return await Rockie.findOne({ where: { id: userId } });
}

// 📌 Crear un nuevo Rockie si el usuario no tiene uno
async function createRockie(userId, username) {
    const existingRockie = await getRockie(userId);
    if (existingRockie) return existingRockie;

    const randomColor = `c${Math.floor(Math.random() * 6) + 1}`; // Elegir color aleatorio (c1 - c6)

    const newRockie = await Rockie.create({
        id: userId, // 📌 Usamos el userId como ID de Rockie
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

    // 📌 Cargar imágenes base
    const baseImage = await loadImage(rockieBasePath);
    ctx.drawImage(baseImage, 0, 0, 512, 512);

    if (clothesPath) {
        const clothesImage = await loadImage(clothesPath);
        ctx.drawImage(clothesImage, 0, 0, 512, 512);
    }

    if (hatPath) {
        const hatImage = await loadImage(hatPath);
        ctx.drawImage(hatImage, 0, 0, 512, 512);
    }

    // 📌 Retornar la imagen en formato buffer
    return canvas.toBuffer("image/png");
}

module.exports = {
    getRockie,
    createRockie,
    levelUpRockie,
    renderRockie,
};

