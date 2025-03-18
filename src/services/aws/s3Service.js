const AWS = require("aws-sdk");
require("dotenv").config();

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const REGION = process.env.AWS_REGION;

// ✅ Construir URL pública dinámica del bucket
const BUCKET_BASE_URL = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com`;

class S3Service {
    constructor() {
        if (!S3Service.instance) {
            this.s3 = new AWS.S3({
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                region: REGION
            });
            S3Service.instance = this;
        }
        return S3Service.instance;
    }

    // 📤 Subir archivo PNG
    async uploadFileToS3(fileBuffer, filePath) {
        const params = {
            Bucket: BUCKET_NAME,
            Key: filePath,
            Body: fileBuffer,
            ContentType: "image/png",
        };

        try {
            const result = await this.s3.upload(params).promise();
            return result.Location; // ✅ URL pública
        } catch (error) {
            console.error("❌ Error al subir archivo a S3:", error);
            return null;
        }
    }

    // 📂 Listar archivos dentro de un folder
    async listFilesInS3(folder) {
        const params = {
            Bucket: BUCKET_NAME,
            Prefix: folder
        };

        try {
            const data = await this.s3.listObjectsV2(params).promise();
            return data.Contents
                .filter(item => item.Key !== folder) // Excluir carpeta raíz
                .map(item => item.Key.replace(folder, ""));
        } catch (error) {
            console.error("❌ Error al listar archivos de S3:", error);
            return [];
        }
    }

    // 🔗 Obtener URL pública de archivo
    getFileUrl(fileName, folder = "") {
        const path = folder ? `${folder}${fileName}` : fileName;
        return `${BUCKET_BASE_URL}/${path}`;
    }

    // ✅ Verificar existencia de archivo
    async fileExistsInS3(filePath) {
        const params = {
            Bucket: BUCKET_NAME,
            Key: filePath,
        };

        try {
            await this.s3.headObject(params).promise();
            return true; // ✅ Existe
        } catch (err) {
            if (err.code === 'NotFound') return false;
            console.error("❌ Error verificando archivo en S3:", err);
            return false;
        }
    }

    // 🧾 Obtener archivo como Buffer
    async getFileBuffer(filePath) {
        const params = {
            Bucket: BUCKET_NAME,
            Key: filePath
        };

        try {
            const data = await this.s3.getObject(params).promise();
            return data.Body; // ✅ Devuelve el buffer
        } catch (error) {
            console.error("❌ Error obteniendo archivo de S3:", error);
            return null;
        }
    }

    // 🗑️ Eliminar archivo
    async deleteFileFromS3(filePath) {
        const params = {
            Bucket: BUCKET_NAME,
            Key: filePath,
        };

        try {
            await this.s3.deleteObject(params).promise();
            console.log(`🗑️ Archivo eliminado: ${filePath}`);
            return true;
        } catch (error) {
            console.error("❌ Error al eliminar archivo en S3:", error);
            return false;
        }
    }
}

module.exports = new S3Service();

