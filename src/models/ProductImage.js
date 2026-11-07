const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class ProductImage extends Model {}

ProductImage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ProductImage",
    tableName: "product_images",
    timestamps: false,
    underscored: true,
  },
);

module.exports = ProductImage;
