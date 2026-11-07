const { Router } = require("express");
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

router.get("/category/search", categoryController.search);
router.get("/category/:id", categoryController.getById);

router.post("/category", authMiddleware, categoryController.create);
router.put("/category/:id", authMiddleware, categoryController.update);
router.delete("/category/:id", authMiddleware, categoryController.remove);

module.exports = router;
