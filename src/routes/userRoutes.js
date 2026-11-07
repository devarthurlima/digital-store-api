const { Router } = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

router.post("/user", userController.register);
router.post("/user/token", userController.generateToken);
router.get("/user/:id", userController.getById);

router.put("/user/:id", authMiddleware, userController.update);
router.delete("/user/:id", authMiddleware, userController.remove);

module.exports = router;
