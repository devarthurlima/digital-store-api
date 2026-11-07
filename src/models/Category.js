const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Category extends Model {}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    use_in_menu: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Category",
    tableName: "categories",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Category;
