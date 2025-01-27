module.exports = (sequelize, DataTypes) => {
  const Item = sequelize.define(
    "Item",
    {
      name: {
        primaryKey: true,
        type: DataTypes.STRING,  
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.STRING,  
        allowNull: false,
      },
      category: {
        type: DataTypes.ENUM("skin", "hat", "clothes"),
        allowNull: false,
      },
      to: {
        type: DataTypes.ENUM("profile", "rocky"),
        allowNull: false,
      },
    },
    {
      tableName: "Item",  
      timestamps: true, 
    }
  );

  return Item;
};
