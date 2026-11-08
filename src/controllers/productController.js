const sequelize = require("../config/database");
const { Product, ProductImage, ProductOption, Category } = require("../models");
const { saveBase64Image } = require("../services/imageService");

async function create(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const {
      enabled = false,
      name,
      slug,
      stock = 0,
      description,
      price,
      price_with_discount,
      category_ids = [],
      images = [],
      options = [],
    } = req.body;

    if (
      !name ||
      !slug ||
      price === undefined ||
      price_with_discount === undefined
    ) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Campos obrigatórios não preenchidos" });
    }

    const product = await Product.create(
      {
        enabled: Boolean(enabled),
        name,
        slug,
        stock: parseInt(stock, 10) || 0,
        description,
        price: parseFloat(price),
        price_with_discount: parseFloat(price_with_discount),
      },
      { transaction },
    );

    if (Array.isArray(category_ids) && category_ids.length > 0) {
      await product.setCategories(category_ids, { transaction });
    }

    if (Array.isArray(images) && images.length > 0) {
      const imageRecords = images.map((img) => {
        const savedPath = saveBase64Image(img.content, img.type);
        return {
          product_id: product.id,
          enabled: true,
          path: savedPath,
        };
      });
      await ProductImage.bulkCreate(imageRecords, { transaction });
    }

    if (Array.isArray(options) && options.length > 0) {
      const optionRecords = options.map((opt) => {
        let rawValues = opt.values || opt.value || [];
        const formattedValues = Array.isArray(rawValues)
          ? rawValues.join(",")
          : String(rawValues);

        let parsedRadius = 0;
        if (opt.radius) {
          parsedRadius =
            parseInt(String(opt.radius).replace("px", ""), 10) || 0;
        }

        return {
          product_id: product.id,
          title: opt.title,
          shape: opt.shape || "square",
          radius: parsedRadius,
          type: opt.type || "text",
          values: formattedValues,
        };
      });
      await ProductOption.bulkCreate(optionRecords, { transaction });
    }

    await transaction.commit();
    return res
      .status(201)
      .json({ id: product.id, message: "Produto criado com sucesso" });
  } catch (error) {
    await transaction.rollback();
    return res.status(400).json({ error: error.message });
  }
}

module.exports = {
  create,
};
