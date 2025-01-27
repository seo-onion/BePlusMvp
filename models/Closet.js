module.exports = (sequelize, DataTypes) => {
  const Closet = sequelize.define(
    "Closet",
    {
      id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "Closet", 
      timestamps: true, 
    }
  );

  return Closet;
};
