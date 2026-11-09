const { Router } = require("express");
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

router.get("/product/search", productController.search);
router.get("/product/:id", productController.getById);
router.post("/product", authMiddleware, productController.create);

module.exports = router;
