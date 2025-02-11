const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST || "localhost",
    dialect: "postgres",
    port: process.env.POSTGRES_PORT || 5432,
    logging: false, // Oculta logs innecesarios
  }
);

sequelize
  .authenticate()
  .then(() => console.log("✅ Conexión a la base de datos exitosa"))
  .catch((err) => console.error("❌ Error de conexión:", err));

module.exports = { sequelize, DataTypes };
