const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const User = require("../models/User");

const router = express.Router();

// Register API
router.post("/register", registerUser);

// Login API
router.post("/login", loginUser);

// Get All Users (for testing database insert)
router.get("/all", async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    res.json(users);  // Return as response
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
