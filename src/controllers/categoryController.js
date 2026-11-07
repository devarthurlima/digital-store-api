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

async function getById(req, res) {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      attributes: ["id", "name", "slug", "use_in_menu"],
    });

    if (!category) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    return res.status(200).json(category);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, slug, use_in_menu } = req.body;

    if (!name || !slug) {
      return res
        .status(400)
        .json({ error: "Os campos name e slug são obrigatórios" });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    await category.update({
      name,
      slug,
      use_in_menu:
        typeof use_in_menu === "boolean" ? use_in_menu : category.use_in_menu,
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    await category.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

module.exports = {
  create,
  getById,
  update,
  remove,
};
