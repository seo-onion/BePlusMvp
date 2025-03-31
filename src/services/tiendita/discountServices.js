const { Op } = require("sequelize");
const Discounts = require('../../models/Tiendita/Discount');
const UserCoupon = require("../../models/Tiendita/UserCoupon")
const UserService = require("../../services/user/userService")
const TransactionService = require("../../services/item/transactionServices")
const { v4: uuidv4 } = require("uuid");

class DiscountService {

    static async validateCoupon(req) {
        const { userId, discount } = req
        if (!userId || !discount) {
            console.error("Missing parameters")
            return null
        }
        try {
            const token = uuidv4();

            return await UserCoupon.create({
                userId,
                discountName: discount.name,
                product: discount.category,
                discountValue: discount.discount,
                token,
                status: "pending",
                discountId: discount.id || null,
            });
        } catch (error) {
            console.error("Qr could not be validated ", error)
        }

    }
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
                attributes: ["id", "name", "discount", "category", "price"],
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
            const { name, discount, category, price } = req;

            if (!name || !discount || !category) {
                console.error("Faltan datos requeridos para crear el descuento.");
                return null;
            }

            return await Discounts.create({
                name,
                discount,
                category,
                price
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

    static async getItemByCategoryAndName(req) {
        const { name, category } = req;
        try {
            if (!name || !category) {
                console.error("Name or category dont given.");
                return null;
            }

            const discount = await Discounts.findOne({
                where: {
                    name: { [Op.iLike]: name },
                    category,
                }
            });

            if (!discount) {
                return null;
            }
            return discount;

        } catch (error) {
            console.error("Error searching for item by name and category: ", error);
            return null;
        }
    }

    static async buyItemByCategoryAndName(req) {
        const { userId, name, category } = req
        try {
            if (!userId || !name || !category) {
                console.error("Data missing");
                return false;
            }

            const discount = await this.getItemByCategoryAndName({ name, category })


            if (!discount) {
                console.error("Discount not found.");
                return false;
            }

            const user = await UserService.getUser(userId);
            if (!user) {
                console.error("user not found");
                return false;
            }

            console.log(user.rockyGems)
            const price = discount.price;
            if (user.rockyGems < price) {
                console.error(`No tienes suficientes rocky gems`);
                return false;
            }

            await TransactionService.createTransaction({ userId, amount: price, type: "compra", badge: "rockyGem", productId: discount.name })

            user.rockyGems -= price;
            await user.save();

            return true;

        } catch (error) {
            console.error("Error al comprar ítem:", error.message);
            return false;
        }
    }

}

module.exports = DiscountService;
