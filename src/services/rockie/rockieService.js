const { createCanvas, loadImage } = require("canvas");
const path = require("path");
const fs = require("fs");
const Rockie = require("../../models/Rockie/Rockie");

// ✅ Retrieve the Rockie instance for a given user.
async function getRockie(userId) {
    try {
        return await Rockie.findOne({ where: { id: userId } });
    } catch (error) {
        console.error(`❌ Error al obtener el Rockie del usuario ${userId}:`, error.message);
        throw error;
    }
}

// ✅ Create a new Rockie for the user if one doesn't already exist.
async function createRockie(userId, username) {
    try {
        const existingRockie = await getRockie(userId);
        if (existingRockie) return existingRockie;

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
    } catch (error) {
        console.error(`❌ Error al crear el Rockie para el usuario ${userId}:`, error.message);
        throw error;
    }
}

// ✅ Level up Rockie, ensuring it doesn't exceed the maximum level.
async function levelUpRockie(userId) {
    try {
        const rockie = await getRockie(userId);
        if (!rockie) return null;

        const newLevel = Math.min(rockie.level + 1, 4);
        await rockie.update({ level: newLevel });

        return rockie;
    } catch (error) {
        console.error(`❌ Error al subir de nivel el Rockie del usuario ${userId}:`, error.message);
        throw error;
    }
}

// ✅ Generate and return Rockie's image, considering its accessories and color.
async function renderRockie(userId) {
    try {
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
            // Load and draw the base Rockie image.
            const baseImage = await loadImage(rockieBasePath);
            ctx.drawImage(baseImage, 0, 0, 512, 512);

            // Load and draw the clothes image if it exists.
            if (clothesPath && fs.existsSync(clothesPath)) {
                const clothesImage = await loadImage(clothesPath);
                ctx.drawImage(clothesImage, 0, 0, 512, 512);
            }

            // Load and draw the hat image if it exists.
            if (hatPath && fs.existsSync(hatPath)) {
                const hatImage = await loadImage(hatPath);
                ctx.drawImage(hatImage, 0, 0, 512, 512);
            }

            return canvas.toBuffer("image/png");

        } catch (error) {
            console.error(`❌ Error cargando las imágenes del Rockie del usuario ${userId}:`, error.message);
            throw error;
        }

    } catch (error) {
        console.error(`❌ Error al renderizar el Rockie del usuario ${userId}:`, error.message);
        throw error;
    }
}

module.exports = {
    getRockie,
    createRockie,
    levelUpRockie,
    renderRockie,
};
