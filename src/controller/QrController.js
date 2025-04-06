const UserCoupon = require("../models/Tiendita/UserCoupon");

const validateCoupon = async (req, res) => {
  const { token } = req.params;
  const cupon = await UserCoupon.findOne({ where: { token } });

  if (!cupon) {
    return res.status(404).send(`
      <html>
        <head><title>Cupón no encontrado</title></head>
        <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
          <h2>❌ Cupón no encontrado</h2>
          <p>El código proporcionado no corresponde a ningún cupón válido.</p>
        </body>
      </html>
    `);
  }

  if (cupon.status === "used") {
    return res.send(`
      <html>
        <head><title>Cupón ya canjeado</title></head>
        <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
          <h2>⚠️ Este cupón ya fue canjeado</h2>
          <p>Descuento de <strong>${cupon.discountValue}%</strong> en <strong>${cupon.product}</strong><br>
          <small>Cupón de: ${cupon.discountName}</small></p>
        </body>
      </html>
    `);
  }

  // Marcar como usado
  cupon.status = "used";
  await cupon.save();

  return res.send(`
    <html>
      <head><title>Cupón válido</title></head>
      <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
        <h2>🎉 ¡Cupón válido! 🎉</h2>
        <p>Has canjeado un <strong>${cupon.discountValue}%</strong> de descuento en <strong>${cupon.product}</strong></p>
        <p><em>Cupón de: ${cupon.discountName}</em></p>
      </body>
    </html>
  `);
};

module.exports = validateCoupon;
