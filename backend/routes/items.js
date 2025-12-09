const express = require("express");
const { addItem, getItems, getUserItems } = require("../controllers/itemController");
const auth = require("../middleware/auth");

const router = express.Router();

// Protected routes
router.post("/add", auth, addItem);
router.get("/my-items", auth, getUserItems);

// Public routes
router.get("/", getItems);

module.exports = router;