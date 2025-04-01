const QRCode = require('qrcode');

const generateQR = async (text, options = {}) => {
  if (options.returnImage) {
    return await QRCode.toBuffer(text); // imagen PNG
  }
  return await QRCode.toDataURL(text); // string base64
};

module.exports = generateQR;
