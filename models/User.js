module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      Userid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      age: {
        type: DataTypes.INTEGER,  
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,  
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,  
        allowNull: false,
      },
      nickname: {
        type: DataTypes.STRING,  
        allowNull: false,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: false,
      }
    },
    {
      tableName: "User",  
      timestamps: true,  
    }
  );

  return User;
};
