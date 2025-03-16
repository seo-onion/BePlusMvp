// 📌 src/services/rockie/renderRockieService.js
const { createCanvas, loadImage } = require("canvas");
const s3Service = require("../aws/s3Service");
const rockieAssetsService = require("./rockieAssetsService");
const Rockie = require("../../models/Rockie/Rockie");

class RenderRockieService {
    constructor() {
        this.canvasSize = 512;
    }

    /**
     * Renders the Rockie image by composing layers from S3.
     * @param {string} userId - Discord user ID.
     * @returns {Promise<Buffer|null>} Buffer of the final image or null on error.
     */
    async renderRockie(userId) {
        const rockie = await Rockie.findByPk(userId);
        if (!rockie) return null;

        const { color, level, hatItem, clothesItem } = rockie;

        try {
            // 📌 Determine Rockie's phase from level
            const phase = rockieAssetsService.determinePhase(level);

            // 📌 Get random expression (eyes + mouth) from S3
            const { eyes, mouth } = await rockieAssetsService.getRandomExpression();
            if (!eyes || !mouth) {
                console.warn("⚠️ No eyes or mouths available for rendering.");
                return null;
            }

            // 📌 Generate full URLs for each layer
            const baseUrl = s3Service.getFileUrl(`BASE${phase}.png`, `bases/${color}/`);
            const hatUrl = hatItem ? s3Service.getFileUrl(hatItem, "sombreros/") : null;
            const clothesUrl = clothesItem ? s3Service.getFileUrl(clothesItem, "ropas/") : null;
            const eyesUrl = s3Service.getFileUrl(eyes, "ojos/");
            const mouthUrl = s3Service.getFileUrl(mouth, "bocas/");

            // 🖼️ Load all layers
            const [baseImage, eyesImage, mouthImage] = await Promise.all([
                loadImage(baseUrl),
                loadImage(eyesUrl),
                loadImage(mouthUrl)
            ]);

            const canvas = createCanvas(this.canvasSize, this.canvasSize);
            const ctx = canvas.getContext("2d");

            ctx.drawImage(baseImage, 0, 0, this.canvasSize, this.canvasSize);

            // 🧢 Optional: Clothes & Hat
            if (clothesUrl) {
                const clothesImage = await loadImage(clothesUrl);
                ctx.drawImage(clothesImage, 0, 0, this.canvasSize, this.canvasSize);
            }

            if (hatUrl) {
                const hatImage = await loadImage(hatUrl);
                ctx.drawImage(hatImage, 0, 0, this.canvasSize, this.canvasSize);
            }

            ctx.drawImage(eyesImage, 0, 0, this.canvasSize, this.canvasSize);
            ctx.drawImage(mouthImage, 0, 0, this.canvasSize, this.canvasSize);

            return canvas.toBuffer("image/png");

        } catch (error) {
            console.error("❌ Error rendering Rockie from S3:", error);
            return null;
        }
    }
}

module.exports = new RenderRockieService();

