const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT || 5432,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Esto es obligatorio para Render
      },
    },
    logging: false,
  }
);

module.exports = { sequelize };
