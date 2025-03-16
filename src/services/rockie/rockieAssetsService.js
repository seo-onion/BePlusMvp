// 📌 Service for managing Rockie's expressions (eyes and mouths) using AWS S3
const { listFilesInS3, uploadFileToS3 } = require("../aws/s3Service");
const path = require("path");

// 📂 Folder constants for organizing expressions in the S3 bucket
const S3_OJOS_FOLDER = "ojos/";
const S3_BOCAS_FOLDER = "bocas/";

class RockieAssetsService {
    /**
     * Fetches all available eye and mouth expressions stored in S3.
     * @returns {Promise<{ eyes: string[], mouths: string[] }>} Object with arrays of file names.
     */
    async getAvailableExpressions() {
        const eyes = await listFilesInS3(S3_OJOS_FOLDER);
        const mouths = await listFilesInS3(S3_BOCAS_FOLDER);
        return { eyes, mouths };
    }

    /**
     * Uploads a PNG image to S3 under the corresponding folder (ojos or bocas).
     * @param {Buffer} buffer - Image file buffer.
     * @param {string} type - Either "ojos" or "bocas".
     * @param {string} fileName - File name for the image.
     * @returns {Promise<string|null>} Public URL of the uploaded file or null on error.
     */
    async uploadExpression(buffer, type, fileName) {
        const folder = type === "ojos" ? S3_OJOS_FOLDER : S3_BOCAS_FOLDER;
        const filePath = path.join(folder, fileName);
        const uploadedUrl = await uploadFileToS3(buffer, filePath);
        return uploadedUrl; // ✅ Return public URL
    }

    /**
     * Retrieves a random combination of eye and mouth images from S3.
     * @returns {Promise<{ eyes: string|null, mouth: string|null }>}
     */
    async getRandomExpression() {
        const { eyes, mouths } = await this.getAvailableExpressions();

        if (!eyes.length || !mouths.length) {
            console.warn("⚠️ No hay expresiones disponibles en S3.");
            return { eyes: null, mouth: null };
        }

        const randomEye = eyes[Math.floor(Math.random() * eyes.length)];
        const randomMouth = mouths[Math.floor(Math.random() * mouths.length)];

        return { eyes: randomEye, mouth: randomMouth };
    }

    /**
     * Determines Rockie's current phase based on level.
     * @param {number} level - Current level of Rockie.
     * @returns {number} Phase (1-4)
     */
    determinePhase(level) {
        return Math.min(level, 4); // ✅ Max 4 phases
    }
}

// ✅ Export as singleton instance
module.exports = new RockieAssetsService();

