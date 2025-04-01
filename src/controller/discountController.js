const { ProcessCredentials } = require('aws-sdk');
const DiscountService = require('../services/tiendita/discountServices');

class DiscountController {
  
  static showCreateForm(req, res) {
    res.render("form-descuento", { mensaje: null });
  }

  static async createDiscount(req, res) {
    const { name, price, discount, category, token } = req.body;

    if (token != process.env.DISCORD_TOKEN) {
        res.render("form-descuento", { mensaje: "El token es incorrecto" })
    }

    const creado = await DiscountService.createDiscount({ name, price, discount, category });

    const mensaje = creado
      ? "✅ Descuento creado con éxito."
      : "❌ No se pudo crear el descuento.";

    res.render("form-descuento", { mensaje });
  }

}

module.exports = DiscountController;
