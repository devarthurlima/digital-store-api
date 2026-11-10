const { Router } = require("express");
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

router.get("/product/search", productController.search);
router.get("/product/:id", productController.getById);

router.post("/product", authMiddleware, productController.create);
router.put("/product/:id", authMiddleware, productController.update);
router.delete("/product/:id", authMiddleware, productController.remove);

module.exports = router;
