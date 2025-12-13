const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

// Public routes
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser); // Changed from "login" to "loginUser"
router.post("/verify-email", authController.verifyEmail);
router.post("/reset-password", authController.resetPassword);

// Protected routes (need token)
router.get("/me", auth, authController.getCurrentUser);
router.put("/update", auth, authController.updateProfile);

// Get All Users (for testing - optional)
router.get("/all", async (req, res) => {
  try {
    const User = require("../models/User");
    const users = await User.find().select('-password');
    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;