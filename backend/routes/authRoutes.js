const express = require("express");

const {
    login,
    getMe,
    register,
    changePassword
} = require("../controllers/authController");

const { protect, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/register", protect, requireAdmin, register);
router.put("/change-password", protect, changePassword);

module.exports = router;
