module.exports = (sequelize, DataTypes) => {
  const Profile = sequelize.define(
    "Profile",
    {
      id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
      },
      record: {
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
      tableName: "Profile", 
      timestamps: true,  
    }
  );

  return Profile;
};
