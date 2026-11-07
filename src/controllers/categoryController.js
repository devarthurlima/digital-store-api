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

module.exports = {
  create,
  getById,
};
