const { Op } = require("sequelize");
const sequelize = require("../config/database");
const { Product, ProductImage, ProductOption, Category } = require("../models");
const { saveBase64Image } = require("../services/imageService");

async function search(req, res) {
  try {
    const {
      limit = 12,
      page = 1,
      match,
      category_ids,
      "price-range": priceRange,
      option,
    } = req.query;

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);

    const whereProduct = {};

    if (match) {
      whereProduct[Op.or] = [
        { name: { [Op.like]: `%${match}%` } },
        { description: { [Op.like]: `%${match}%` } },
      ];
    }

    if (priceRange) {
      const [minPrice, maxPrice] = priceRange
        .split("-")
        .map((val) => parseFloat(val));
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        whereProduct.price = { [Op.between]: [minPrice, maxPrice] };
      }
    }

    const includeCategories = {
      model: Category,
      as: "categories",
      attributes: ["id"],
      through: { attributes: [] },
    };

    if (category_ids) {
      const ids = category_ids
        .split(",")
        .map((id) => parseInt(id.trim(), 10))
        .filter(Boolean);
      if (ids.length > 0) {
        includeCategories.where = { id: { [Op.in]: ids } };
      }
    }

    const includeOptions = {
      model: ProductOption,
      as: "options",
      attributes: ["id", "title", "shape", "radius", "type", "values"],
    };

    if (option && typeof option === "object") {
      const optionConditions = [];

      for (const [optionId, optionValues] of Object.entries(option)) {
        const parsedOptionId = parseInt(optionId, 10);
        const valuesList = String(optionValues)
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);

        const valueOrConditions = valuesList.map((val) => ({
          values: { [Op.like]: `%${val}%` },
        }));

        const condition = {
          id: parsedOptionId,
        };

        if (valueOrConditions.length > 0) {
          condition[Op.or] = valueOrConditions;
        }

        optionConditions.push(condition);
      }

      if (optionConditions.length > 0) {
        includeOptions.where = { [Op.or]: optionConditions };
      }
    }

    const queryOptions = {
      distinct: true,
      where: whereProduct,
      include: [
        includeCategories,
        {
          model: ProductImage,
          as: "images",
          attributes: ["id", "path"],
        },
        includeOptions,
      ],
    };

    if (parsedLimit !== -1) {
      queryOptions.limit = parsedLimit;
      queryOptions.offset = (parsedPage - 1) * parsedLimit;
    }

    const { rows: products, count: total } =
      await Product.findAndCountAll(queryOptions);

    const data = products.map((product) => ({
      id: product.id,
      enabled: product.enabled,
      name: product.name,
      slug: product.slug,
      stock: product.stock,
      description: product.description,
      price: product.price,
      price_with_discount: product.price_with_discount,
      category_ids: product.categories.map((c) => c.id),
      images: product.images.map((img) => ({
        id: img.id,
        content: img.path,
      })),
      options: product.options.map((opt) => ({
        id: opt.id,
        title: opt.title,
        shape: opt.shape,
        radius: opt.radius,
        type: opt.type,
        values: opt.values.split(","),
      })),
    }));

    return res.status(200).json({
      data,
      total,
      limit: parsedLimit,
      page: parsedLimit === -1 ? 1 : parsedPage,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

async function create(req, res) {
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
    return res
      .status(400)
      .json({ error: "Campos obrigatórios não preenchidos" });
  }

  if (
    !Array.isArray(category_ids) ||
    !Array.isArray(images) ||
    !Array.isArray(options)
  ) {
    return res.status(400).json({
      error: "Os campos category_ids, images e options devem ser listas",
    });
  }

  const transaction = await sequelize.transaction();

  try {
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

    if (category_ids.length > 0) {
      await product.setCategories(category_ids, { transaction });
    }

    if (images.length > 0) {
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

    if (options.length > 0) {
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

async function getById(req, res) {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: "categories",
          attributes: ["id"],
          through: { attributes: [] },
        },
        {
          model: ProductImage,
          as: "images",
          attributes: ["id", "path"],
        },
        {
          model: ProductOption,
          as: "options",
          attributes: ["id", "title", "shape", "radius", "type", "values"],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    const formattedProduct = {
      id: product.id,
      enabled: product.enabled,
      name: product.name,
      slug: product.slug,
      stock: product.stock,
      description: product.description,
      price: product.price,
      price_with_discount: product.price_with_discount,
      category_ids: product.categories.map((c) => c.id),
      images: product.images.map((img) => ({
        id: img.id,
        content: img.path,
      })),
      options: product.options.map((opt) => ({
        id: opt.id,
        title: opt.title,
        shape: opt.shape,
        radius: opt.radius,
        type: opt.type,
        values: opt.values.split(","),
      })),
    };

    return res.status(200).json(formattedProduct);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

async function update(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      enabled,
      name,
      slug,
      stock,
      description,
      price,
      price_with_discount,
      category_ids,
      images,
      options,
    } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    const updateFields = {};
    if (enabled !== undefined) updateFields.enabled = Boolean(enabled);
    if (name) updateFields.name = name;
    if (slug) updateFields.slug = slug;
    if (stock !== undefined) updateFields.stock = parseInt(stock, 10) || 0;
    if (description !== undefined) updateFields.description = description;
    if (price !== undefined) updateFields.price = parseFloat(price);
    if (price_with_discount !== undefined)
      updateFields.price_with_discount = parseFloat(price_with_discount);

    await product.update(updateFields, { transaction });

    if (Array.isArray(category_ids)) {
      await product.setCategories(category_ids, { transaction });
    }

    if (Array.isArray(images)) {
      for (const img of images) {
        if (img.id && img.deleted) {
          await ProductImage.destroy({
            where: { id: img.id, product_id: product.id },
            transaction,
          });
        } else if (img.id) {
          const imgRecord = await ProductImage.findOne({
            where: { id: img.id, product_id: product.id },
            transaction,
          });
          if (imgRecord) {
            const newPath = img.content
              ? saveBase64Image(img.content, img.type)
              : imgRecord.path;
            await imgRecord.update({ path: newPath }, { transaction });
          }
        } else if (img.content) {
          const savedPath = saveBase64Image(img.content, img.type);
          await ProductImage.create(
            {
              product_id: product.id,
              enabled: true,
              path: savedPath,
            },
            { transaction },
          );
        }
      }
    }

    if (Array.isArray(options)) {
      for (const opt of options) {
        if (opt.id && opt.deleted) {
          await ProductOption.destroy({
            where: { id: opt.id, product_id: product.id },
            transaction,
          });
        } else if (opt.id) {
          const optRecord = await ProductOption.findOne({
            where: { id: opt.id, product_id: product.id },
            transaction,
          });
          if (optRecord) {
            let rawValues = opt.values || opt.value || optRecord.values;
            const formattedValues = Array.isArray(rawValues)
              ? rawValues.join(",")
              : String(rawValues);

            let parsedRadius = optRecord.radius;
            if (opt.radius !== undefined) {
              parsedRadius =
                parseInt(String(opt.radius).replace("px", ""), 10) || 0;
            }

            await optRecord.update(
              {
                title: opt.title || optRecord.title,
                shape: opt.shape || optRecord.shape,
                radius: parsedRadius,
                type: opt.type || optRecord.type,
                values: formattedValues,
              },
              { transaction },
            );
          }
        } else if (opt.title) {
          let rawValues = opt.values || opt.value || [];
          const formattedValues = Array.isArray(rawValues)
            ? rawValues.join(",")
            : String(rawValues);

          let parsedRadius = 0;
          if (opt.radius) {
            parsedRadius =
              parseInt(String(opt.radius).replace("px", ""), 10) || 0;
          }

          await ProductOption.create(
            {
              product_id: product.id,
              title: opt.title,
              shape: opt.shape || "square",
              radius: parsedRadius,
              type: opt.type || "text",
              values: formattedValues,
            },
            { transaction },
          );
        }
      }
    }

    await transaction.commit();
    return res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    return res.status(400).json({ error: error.message });
  }
}
module.exports = {
  search,
  create,
  getById,
  update,
};
