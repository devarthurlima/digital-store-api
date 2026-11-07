const { Router } = require("express");
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

router.get("/category/:id", categoryController.getById);

router.post("/category", authMiddleware, categoryController.create);

module.exports = router;
