const { Router } = require("express");
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

router.post("/category", authMiddleware, categoryController.create);

module.exports = router;
