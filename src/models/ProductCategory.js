const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class ProductCategory extends Model {}

ProductCategory.init(
  {
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categories",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "ProductCategory",
    tableName: "product_categories",
    timestamps: false,
    underscored: true,
  },
);

module.exports = ProductCategory;
