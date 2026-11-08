const { Router } = require("express");
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

router.post("/product", authMiddleware, productController.create);

module.exports = router;
