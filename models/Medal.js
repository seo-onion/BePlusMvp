module.exports = (sequelize, DataTypes) => {
  const Medal = sequelize.define(
    "Medal",
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
    },
    {
      tableName: "Medal",  
      timestamps: true,  
    }
  );

  return Medal;
};
