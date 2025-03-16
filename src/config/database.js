const { Sequelize } = require('sequelize');

const isProduction = (process.env.NODE_ENV === "production");

const sequelize = isProduction
  ? new Sequelize(process.env.DB_URL, {
      dialect: "postgres",
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      logging: false,
    })
  : new Sequelize(
      process.env.DB_POSTGRES,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 5433,
        dialect: "postgres",  
        logging: false,
      }
    );

module.exports = { sequelize };
