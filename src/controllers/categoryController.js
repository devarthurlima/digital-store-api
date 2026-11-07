const { Category } = require("../models");

async function create(req, res) {
  try {
    const { name, slug, use_in_menu } = req.body;

    if (!name || !slug) {
      return res
        .status(400)
        .json({ error: "Os campos name e slug são obrigatórios" });
    }

    const category = await Category.create({
      name,
      slug,
      use_in_menu: typeof use_in_menu === "boolean" ? use_in_menu : false,
    });

    return res.status(201).json({
      id: category.id,
      name: category.name,
      slug: category.slug,
      use_in_menu: category.use_in_menu,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

module.exports = {
  create,
};
