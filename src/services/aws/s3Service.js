// 📌 AWS S3 Service for uploading and listing Rockie assets
const AWS = require("aws-sdk");
require("dotenv").config();

const requiredEnvVars = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION", "AWS_BUCKET_NAME"];
for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
        throw new Error(`❌ Missing required environment variable: ${varName}`);
    }
}

// ✅ Initialize AWS S3 Client (singleton)
class S3Service {
    constructor() {
        if (!S3Service.instance) {
            this.s3 = new AWS.S3({
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                region: process.env.AWS_REGION,
            });

            this.bucketName = process.env.AWS_BUCKET_NAME;
            this.baseBucketUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com`;
            S3Service.instance = this;
        }
        return S3Service.instance;
    }

    /**
     * Uploads a PNG file to S3 (overwrites if it exists).
     * @param {Buffer} fileBuffer - File content.
     * @param {string} filePath - Full path in bucket (e.g., 'ojos/1.png').
     * @returns {Promise<string|null>} Public URL or null if failed.
     */
    async uploadFileToS3(fileBuffer, filePath) {
        const params = {
            Bucket: this.bucketName,
            Key: filePath,
            Body: fileBuffer,
            ContentType: "image/png",
            // ACL removed due to error: AccessControlListNotSupported
        };

        try {
            const uploadResult = await this.s3.upload(params).promise();
            return this.getFileUrl(filePath);
        } catch (error) {
            console.error("❌ Error uploading file to S3:", error);
            return null;
        }
    }

    /**
     * Lists files in a given folder in the S3 bucket.
     * @param {string} folder - e.g., 'ojos/' or 'bases/1/'
     * @returns {Promise<string[]>} Array of file names.
     */
    async listFilesInS3(folder) {
        const params = {
            Bucket: this.bucketName,
            Prefix: folder,
        };

        try {
            const data = await this.s3.listObjectsV2(params).promise();
            return data.Contents
                .filter(item => item.Key !== folder)
                .map(item => item.Key.replace(folder, ""));
        } catch (error) {
            console.error("❌ Error listing files in S3:", error);
            return [];
        }
    }

    /**
     * Generates full public URL of a file in S3.
     * @param {string} filePath - Full path in bucket (e.g., 'ojos/1.png').
     * @returns {string} Full URL.
     */
    getFileUrl(filePath) {
        return `${this.baseBucketUrl}/${filePath}`;
    }
}

// ✅ Export singleton
module.exports = new S3Service();

