'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Cargar automáticamente todos los modelos
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Configurar asociaciones entre modelos
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Importar modelos manualmente para las relaciones
const { Profile, Item, Rocky, User, Closet, Medal } = db;

// Relación entre Profile e Item
Profile.belongsTo(Item, { as: 'skinAssociatedItem', foreignKey: 'skinItemId' });
Profile.belongsTo(Item, { as: 'hatAssociatedItem', foreignKey: 'hatItemId' });
Profile.belongsTo(Item, { as: 'clothesAssociatedItem', foreignKey: 'clothesItemId' });

// Relación entre Rocky e Item
Rocky.belongsTo(Item, { as: 'skinAssociatedItem', foreignKey: 'skinItemId' });
Rocky.belongsTo(Item, { as: 'hatAssociatedItem', foreignKey: 'hatItemId' });
Rocky.belongsTo(Item, { as: 'clothesAssociatedItem', foreignKey: 'clothesItemId' });

// Relación muchos a muchos entre User e Item (a través de Closet)
User.belongsToMany(Item, { through: Closet, foreignKey: "userId", as: "closetItems" });
Item.belongsToMany(User, { through: Closet, foreignKey: "itemId", as: "usersWithItem" });

// Relación uno a uno: User -> Profile
User.hasOne(Profile, { foreignKey: "userId", as: "profile" });
Profile.belongsTo(User, { foreignKey: "userId", as: "user" });

// Relación uno a uno: User -> Rocky
User.hasOne(Rocky, { foreignKey: "userId", as: "rocky" });
Rocky.belongsTo(User, { foreignKey: "userId", as: "user" });

// Relación entre User y Medal
User.hasMany(Medal, { foreignKey: "userId", as: "medals" });
Medal.belongsTo(User, { foreignKey: "userId", as: "user" });

// Exportar modelos y la instancia de Sequelize
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
