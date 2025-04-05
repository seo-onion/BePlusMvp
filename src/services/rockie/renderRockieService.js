const { createCanvas, loadImage } = require("canvas");
const s3Service = require("../aws/s3Service");
const rockieAssetsService = require("./rockieAssetsService");
const Rockie = require("../../models/Rockie/Rockie");

class RenderRockieService {
  constructor() {
    this.canvasSize = 512;
  }

  async renderRockie(userId) {
    const rockie = await Rockie.findByPk(userId);
    if (!rockie) return null;

    const { color, level, hatItem, clothesItem } = rockie;

    try {
      const phase = rockieAssetsService.determinePhase(level);
      const { eyes, mouth } = await rockieAssetsService.getRandomExpression();

      if (!eyes || !mouth) {
        console.warn("⚠️ No eyes or mouths available for rendering.");
        return null;
      }

      // ✅ Prefijo assets/ para base, ropa y sombreros
      const basePath = `assets/bases/${color}/BASE${phase}.png`;
      const hatPath = hatItem ? `assets/sombreros/${hatItem}` : null;
      const clothesPath = clothesItem ? `assets/ropas/${clothesItem}` : null;
      const eyesPath = `ojos/${eyes}`;
      const mouthPath = `bocas/${mouth}`;

      // ✅ Validación HEAD en S3
      const urlsToCheck = [basePath, eyesPath, mouthPath, clothesPath, hatPath].filter(Boolean);
      for (const filePath of urlsToCheck) {
        const exists = await s3Service.fileExistsInS3(  );
        if (!exists) throw new Error(`❌ Archivo de ${filePath} no encontrado en S3.`);
      }

      // 🖼️ Descargar imágenes desde S3
      const [baseBuffer, eyesBuffer, mouthBuffer] = await Promise.all([
        s3Service.getFileBuffer(basePath),
        s3Service.getFileBuffer(eyesPath), 
        s3Service.getFileBuffer(mouthPath)
      ]);

      const baseImage = await loadImage(baseBuffer);
      const eyesImage = await loadImage(eyesBuffer);
      const mouthImage = await loadImage(mouthBuffer);

      const canvas = createCanvas(this.canvasSize, this.canvasSize);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, this.canvasSize, this.canvasSize);

      // 🧢 Optional: Clothes & Hat
      if (clothesPath) {
        const clothesBuffer = await s3Service.getFileBuffer(clothesPath);
        const clothesImage = await loadImage(clothesBuffer);
        ctx.drawImage(clothesImage, 0, 0, this.canvasSize, this.canvasSize);
      }

      if (hatPath) {
        const hatBuffer = await s3Service.getFileBuffer(hatPath);
        const hatImage = await loadImage(hatBuffer);
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

