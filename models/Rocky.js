module.exports = (sequelize, DataTypes) => {
  const Rocky = sequelize.define(
    "Rocky",
    {
      id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,  
        allowNull: false,
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      skinItem: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      hatItem: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      clothesItem: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "Rocky",  
      timestamps: true,  
    }
  );

  return Rocky;
};
