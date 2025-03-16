const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const Items = require("../Item/Items");

const Store = sequelize.define("Store", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, { timestamps: false });

Store.hasMany(Items, { foreignKey: "storeId", onDelete: "CASCADE" });
Items.belongsTo(Store, { foreignKey: "storeId" });

module.exports =  Store ;
