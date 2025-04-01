const { DataTypes } = require("sequelize");
const {sequelize} = require("../../config/database");
const Discounts = require("./Discount");

const UserCoupon = sequelize.define("UserCoupon", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  discountName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  product: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  discountValue: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "used"),
    defaultValue: "pending",
  },
  discountId: {
    type: DataTypes.UUID,
    allowNull: true, 
    references: {
      model: "Discounts",
      key: "id",
    },
  },
});


UserCoupon.belongsTo(Discounts, {foreignKey: "discountId"});

module.exports = UserCoupon;
