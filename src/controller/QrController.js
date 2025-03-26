const UserCoupon = require("../models/Tiendita/UserCoupon");

const validateCoupon = async (req, res) => {
  const { token } = req.params;
  const cupon = await UserCoupon.findOne({ where: { token } });

  if (!cupon) return res.status(404).send('Cupon no encontrado');
  if (cupon.status === "used") return res.send('Este cupon ya fue utilizado');

  cupon.status = "usado";
  await cupon.save();

  res.send(`
    🎉 Cupón válido 🎉 <br>
    Producto: ${cupon.product} <br>
    Descuento: ${cupon.discountValue}% <br>
    Cupón de: ${cupon.discountName}
  `);
};

module.exports = validateCoupon;
