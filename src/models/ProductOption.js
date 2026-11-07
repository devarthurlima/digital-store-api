const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class ProductOption extends Model {}

ProductOption.init(
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shape: {
      type: DataTypes.ENUM("square", "circle"),
      defaultValue: "square",
      allowNull: true,
    },
    radius: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM("text", "color"),
      defaultValue: "text",
      allowNull: true,
    },
    values: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ProductOption",
    tableName: "product_options",
    timestamps: false,
    underscored: true,
  },
);

module.exports = ProductOption;
