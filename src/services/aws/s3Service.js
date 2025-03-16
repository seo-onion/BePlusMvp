// 📌 src/services/aws/s3Service.js
const AWS = require("aws-sdk");
require("dotenv").config();

/**
 * Singleton class to interact with AWS S3 for Rockie assets.
 */
class S3Service {
    constructor() {
        if (!S3Service.instance) {
            this.s3 = new AWS.S3({
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                region: process.env.AWS_REGION
            });
            S3Service.instance = this;
        }
        return S3Service.instance;
    }

    /**
     * Uploads a file to the specified S3 bucket and folder.
     * @param {Buffer} fileBuffer - The binary content of the file.
     * @param {string} filePath - The folder and file name in the bucket (e.g., 'ojos/1.png').
     * @returns {Promise<string|null>} Public URL of the uploaded file or null on error.
     */
    async uploadFileToS3(fileBuffer, filePath) {
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: filePath,
            Body: fileBuffer,
            ContentType: "image/png",
            ACL: "public-read"
        };

        try {
            const uploadResult = await this.s3.upload(params).promise();
            return uploadResult.Location; // ✅ Return public URL
        } catch (error) {
            console.error("❌ Error al subir archivo a S3:", error);
            return null;
        }
    }

    /**
     * Lists all files in a given folder inside the S3 bucket.
     * @param {string} folder - Folder path in the bucket (e.g., 'ojos/').
     * @returns {Promise<string[]>} Array of file names in the specified folder.
     */
    async listFilesInS3(folder) {
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Prefix: folder
        };

        try {
            const data = await this.s3.listObjectsV2(params).promise();
            return data.Contents
                .filter(item => item.Key !== folder)
                .map(item => item.Key.replace(folder, ""));
        } catch (error) {
            console.error("❌ Error al listar archivos de S3:", error);
            return [];
        }
    }

    /**
     * Generates the full public URL for a file in S3.
     * @param {string} fileName - Name of the file.
     * @param {string} folder - Folder path (e.g., 'ojos/').
     * @returns {string} Full public URL.
     */
    getFileUrl(fileName, folder = "") {
        return `${process.env.AWS_BUCKET_URL}/${folder}${fileName}`;
    }
}

// ✅ Export as singleton instance
module.exports = new S3Service();

