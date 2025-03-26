const { Op } = require("sequelize");
const Discounts = require('../../models/Tiendita/Discount');

class DiscountService {

    static async getDiscount(identifier) {
        try {
            return await Discounts.findOne({
                where: {
                    [Op.or]: [{ id: identifier }, { name: identifier }]
                }
            });
        } catch (error) {
            console.error("Error al obtener el descuento:", error.message);
            return null;
        }
    }

    static async getAllDiscounts() {
        try {
            return await Discounts.findAll();
        } catch (error) {
            console.error("Error al obtener todos los descuentos:", error.message);
            return null;
        }
    }

    static async getAvailableDiscounts() {
        try {
            return await Discounts.findAll({
                attributes: ["id", "name", "discount", "category"],
                raw: true,
                order: [["category", "ASC"]],
            });
        } catch (error) {
            console.error("Error to obtain discount:", error.message);
            return null;
        }
    }


    static async createDiscount(req) {
        try {
            const { name, discount, category } = req;

            if (!name || !discount || !category) {
                console.error("Faltan datos requeridos para crear el descuento.");
                return null;
            }

            return await Discounts.create({
                name,
                discount,
                category
            });

        } catch (error) {
            console.error("Error al crear el descuento:", error.message);
            return null;
        }
    }

    static async updateDiscount(req) {
        try {
            const { identifier, ...updateFields } = req;

            if (!identifier || Object.keys(updateFields).length === 0) {
                console.error("Se requiere un identificador y al menos un campo para actualizar.");
                return null;
            }

            const discount = await this.getDiscount(identifier);
            if (!discount) {
                console.error(`No se encontró un descuento con el identificador: ${identifier}`);
                return null;
            }

            await discount.update(updateFields);
            return discount;

        } catch (error) {
            console.error("Error al actualizar el descuento:", error.message);
            return null;
        }
    }

    static async deleteDiscount(req) {
        const { identifier } = req;

        try {
            const discount = await this.getDiscount(identifier);
            if (!discount) {
                console.error("No se encontró el descuento a eliminar.");
                return null;
            }

            await discount.destroy();
            return discount;

        } catch (error) {
            console.error("Error al eliminar el descuento:", error.message);
            return null;
        }
    }

    static async getDiscountsByCategory(category, attributes = ["id", "name", "discount"]) {
        if (!category) {
            console.error("Falta la categoría para buscar descuentos.");
            return null;
        }

        try {
            const discounts = await Discounts.findAll({
                where: { category },
                attributes,
                raw: true
            });

            if (discounts.length === 0) {
                console.log(`No se encontraron descuentos en la categoría: ${category}`);
                return [];
            }

            return discounts;

        } catch (error) {
            console.error("Error al buscar descuentos por categoría:", error.message);
            return null;
        }
    }

}

module.exports = DiscountService;
